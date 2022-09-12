const Devices = () => import("../components/Devices.vue");
const Scripts = () => import("../components/Scripts.vue");
const NotFound = () => import("../components/NotFound.vue");

export const routes = [
  {
    path: "/",
    redirect: {
      name: "Devices"
    },
    display: false
  },
  {
    name: "Devices",
    title: "Devices",
    path: "/devices",
    component: Devices,
    display: true,
    icon: "server"
  },
  {
    name: "Scripts",
    title: "Scripts",
    path: "/scripts",
    component: Scripts,
    display: true,
    icon: "file-code"
  },
  {
    name: "NotFound",
    title: "Ressource Not Found",
    path: "/not-found",
    component: NotFound,
    display: false
  },
  {
    path: "/*",
    redirect: {
      name: "NotFound"
    },
    display: false
  }
];
