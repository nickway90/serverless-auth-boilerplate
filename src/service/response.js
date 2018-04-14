// CORS enabled lambda proxy response
module.exports = (res, status) => {
  const body = JSON.stringify(res);
  return {
    statusCode: status || 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body,
  };
};
