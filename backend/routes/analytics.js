const express = require('express');
const router = express.Router();
const http = require('http');
const Analytics = require('../models/Analytics');
const Contact = require('../models/Contact');
const Guestbook = require('../models/Guestbook');
const auth = require('../middleware/auth');

// Helper to look up country by IP
async function fetchCountry(ip) {
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local Host', region: 'Local Network' };
  }

  return new Promise((resolve) => {
    http.get(`http://ip-api.com/json/${ip}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === 'success') {
            resolve({
              country: parsed.country || 'Unknown',
              region: parsed.regionName || 'Unknown'
            });
          } else {
            resolve({ country: 'Unknown', region: 'Unknown' });
          }
        } catch (e) {
          resolve({ country: 'Unknown', region: 'Unknown' });
        }
      });
    }).on('error', () => {
      resolve({ country: 'Unknown', region: 'Unknown' });
    });
  });
}

// @route   POST api/analytics
// @desc    Log a pageview or event
// @access  Public
router.post('/', async (req, res) => {
  const { path, eventType, elementId } = req.body;

  // Retrieve client IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Parse User Agent
  const userAgent = req.headers['user-agent'] || '';
  let browser = 'Other';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let os = 'Other';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone|iPad/i.test(userAgent)) device = 'Mobile';

  try {
    const geo = await fetchCountry(ip);

    const logEntry = new Analytics({
      ip,
      country: geo.country,
      region: geo.region,
      browser,
      os,
      device,
      path: path || '/',
      eventType: eventType || 'pageview',
      elementId: elementId || ''
    });

    await logEntry.save();
    res.status(201).json({ msg: 'Analytics logged' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/analytics/stats
// @desc    Get statistics for charts
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // 1. Core Counts
    const totalViews = await Analytics.countDocuments({ eventType: 'pageview' });
    const totalContacts = await Contact.countDocuments();
    const pendingContacts = await Contact.countDocuments({ isRead: false });
    const totalComments = await Guestbook.countDocuments({ approved: true });
    const pendingComments = await Guestbook.countDocuments({ approved: false });

    // 2. Pageviews past 7 days (Daily data)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const pageviewsDaily = await Analytics.aggregate([
      {
        $match: {
          eventType: 'pageview',
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format daily data to make sure all 7 days have entries even if 0
    const dailyViewsFormatted = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = pageviewsDaily.find(item => item._id === dateStr);
      dailyViewsFormatted.push({
        date: dateStr.substring(5), // MM-DD
        views: match ? match.count : 0
      });
    }

    // 3. Geolocation stats (Country distribution)
    const countryDistribution = await Analytics.aggregate([
      { $match: { eventType: 'pageview' } },
      {
        $group: {
          _id: '$country',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);
    const geoStats = countryDistribution.map(item => ({
      name: item._id,
      value: item.value
    }));

    // 4. Action Click Distribution (e.g. resume clicks vs github clicks)
    const clickInteractions = await Analytics.aggregate([
      { $match: { eventType: 'click' } },
      {
        $group: {
          _id: '$elementId',
          clicks: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } },
      { $limit: 10 }
    ]);
    const clickStats = clickInteractions.map(item => ({
      name: item._id || 'other',
      clicks: item.clicks
    }));

    // 5. Operating System distribution
    const osDistribution = await Analytics.aggregate([
      { $match: { eventType: 'pageview' } },
      {
        $group: {
          _id: '$os',
          count: { $sum: 1 }
        }
      }
    ]);
    const osStats = osDistribution.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.json({
      summary: {
        totalViews,
        totalContacts,
        pendingContacts,
        totalComments,
        pendingComments
      },
      dailyViews: dailyViewsFormatted,
      geoStats,
      clickStats,
      osStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
