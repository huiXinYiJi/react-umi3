export default function (initialState: API.UserParamsType) {
  // console.log('access', initialState);
  const auth = initialState?.role_id;
  return auth
    ? {
        admin: auth === 1, //超级管理员
        operator: auth === 2, // 运营
        partTime: auth === 3, // 兼职平台管理员
      }
    : {};
}
