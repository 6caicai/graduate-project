// 清除前端认证缓存
if (typeof window !== 'undefined') {
  localStorage.removeItem('campusphoto_token')
  localStorage.removeItem('campusphoto_user')
  console.log('已清除认证缓存')
}
