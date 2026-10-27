const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/project' },
      { path: 'project', component: () => import('../pages/UploadPage.vue') },
      { path: 'knowledge/:id', component: () => import('../pages/KnowledgePage.vue') }
    ]
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

export default routes
