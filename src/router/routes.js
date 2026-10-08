const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'projects/:id/upload', component: () => import('@/pages/UploadPage.vue') }
    ],
  },


]

export default routes
