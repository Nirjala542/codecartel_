const axios = require('axios');

const jobBoardService = {
  fetchJobs: async (query, location) => {
    try {
      const jobs = [];
      const MAX_JOBS = 5; // We limit to 5 jobs to conserve API credits during evaluation
      
      // 1. Fetch from Arbeitnow (Tech startup jobs)
      try {
        const arbeitnowRes = await axios.get('https://arbeitnow.com/api/job-board-api');
        const data = arbeitnowRes.data.data;
        
        let filteredArbeit = data.filter(job => {
          let matchesQuery = true;
          if (query) {
            const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 0);
            const searchTarget = (job.title + ' ' + job.company_name).toLowerCase();
            // All words in query must exist in title or company
            matchesQuery = queryWords.every(word => searchTarget.includes(word));
          }
          let matchesLoc = true;
          if (location) {
            matchesLoc = job.location.toLowerCase().includes(location.toLowerCase());
          }
          return matchesQuery && matchesLoc;
        });

        // Take top 3 from arbeitnow
        for (let i = 0; i < Math.min(3, filteredArbeit.length); i++) {
          const j = filteredArbeit[i];
          jobs.push({
            id: `arbeitnow_${j.slug}`,
            role: j.title,
            company: j.company_name,
            location: j.location,
            platform: 'Arbeitnow',
            posted: new Date(j.created_at * 1000).toISOString(),
            description: j.description.replace(/<[^>]+>/g, '').substring(0, 800), // Clean HTML, limit size
            url: j.url,
            salary: 'Not specified'
          });
        }
      } catch (err) {
        console.error('Arbeitnow API error:', err.message);
      }

      // 2. Fetch from RemoteOK
      try {
        // Use only the first word of the query for the RemoteOK tag, as their tag system is strict.
        // We will locally filter the results for the full multi-word query afterwards.
        const remoteOkTag = query ? query.toLowerCase().trim().split(' ')[0] : 'developer';
        const remoteOkUrl = `https://remoteok.com/api?tag=${encodeURIComponent(remoteOkTag)}`;
        // RemoteOK blocks generic user agents, use a browser one
        const remoteOkRes = await axios.get(remoteOkUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const data = remoteOkRes.data.slice(1); // First element is legal text
        
        let filteredRemote = data.filter(job => {
          let matchesQuery = true;
          if (query) {
             const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 0);
             const searchTarget = (job.position + ' ' + job.company).toLowerCase();
             matchesQuery = queryWords.every(word => searchTarget.includes(word));
          }
          if (location && job.location && !job.location.toLowerCase().includes(location.toLowerCase())) {
            return false;
          }
          return matchesQuery;
        });

        // Fill the rest of MAX_JOBS from RemoteOK
        const remainingSpots = MAX_JOBS - jobs.length;
        for (let i = 0; i < Math.min(remainingSpots, filteredRemote.length); i++) {
          const j = filteredRemote[i];
          jobs.push({
            id: `remoteok_${j.id}`,
            role: j.position,
            company: j.company,
            location: j.location || 'Remote',
            platform: 'RemoteOK',
            posted: new Date(j.date).toISOString(),
            description: j.description.replace(/<[^>]+>/g, '').substring(0, 800),
            url: j.url,
            salary: j.salary_min && j.salary_max ? `$${Math.round(j.salary_min/1000)}k - $${Math.round(j.salary_max/1000)}k` : 'Not specified'
          });
        }
      } catch (err) {
        console.error('RemoteOK API error:', err.message);
      }

      return jobs;

    } catch (err) {
      console.error('Error in jobBoardService:', err.message);
      return [];
    }
  }
};

module.exports = jobBoardService;
