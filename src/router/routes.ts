import type {RouteRecordRaw} from 'vue-router';
import App from '@/App.vue';

const HelloWorld = () => import('@/components/HelloWorld.vue').then(m => m.default);

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: App,
    redirect: {
      name: 'HelloWorld'
    },
    children: [
      {
        name: 'HelloWorld',
        path: 'hello-world',
        component: HelloWorld
      }
    ]
  }
]
