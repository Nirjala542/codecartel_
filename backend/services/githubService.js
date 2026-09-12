const axios = require('axios');

const githubService = {
  fetchUserData: async (accessToken) => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      // Fetch repos
      const reposResponse = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=10', { headers });
      const repos = reposResponse.data;

      // Extract languages and top repos
      const languageMap = {};
      const topRepos = [];

      repos.forEach(repo => {
        if (repo.language) {
          languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }
        if (topRepos.length < 3) {
          topRepos.push({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count
          });
        }
      });

      const topLanguages = Object.entries(languageMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      return {
        reposCount: repos.length,
        topLanguages,
        topRepos,
        rawReposContext: repos.map(r => `${r.name} (${r.language}): ${r.description}`).join('; ')
      };
    } catch (error) {
      console.error('Error fetching GitHub user data:', error.message);
      return null;
    }
  }
};

module.exports = githubService;
