const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/project' },
      { path: 'project', component: () => import('@/pages/UploadPage.vue') },
      { path: 'projects/:id/upload', redirect: '/project' }
    ],
  },


]

export default routes
