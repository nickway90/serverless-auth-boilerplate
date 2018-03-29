const CHROMELESS_CONFIG = {
  remote: {
    endpointUrl: process.env.CHROMELESS_ENDPOINT,
    apiKey: process.env.CHROMELESS_API_KEY,
  },
};
const CX_PORTAL_ROOT_URL = 'https://remote.cathaypacific.com';
const CX_PORTAL_ROSTER_URL = (date) => `http://intracx.cathaypacific.com/CRS/html/f5-w-doubledot/servlet/EnquireRealTimeRosterController${date ? `?req_mth=${date}&Pass=` : ''}`;
const CX_PORTAL_CREW_URL = (query) => `http://intracx.cathaypacific.com/CRS/html/f5-w-doubledot/servlet/EnquireMayfly?Request=CrewList&Action=roster&${query}`;

module.exports = {
  CHROMELESS_CONFIG,
  CX_PORTAL_ROOT_URL,
  CX_PORTAL_ROSTER_URL,
  CX_PORTAL_CREW_URL,
}
