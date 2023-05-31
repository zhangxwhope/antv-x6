import Vue from "vue";
import VueRouter from "vue-router";
import AntVX6 from "../views/AntVX6.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "AntVX6",
    component: AntVX6,
  },
  {
    path: "/antvX6Show",
    name: "AntvX6Show",
    component: () => import("../views/AntvX6Show.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
