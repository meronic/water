import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHashHistory } from "vue-router";
import { useLogsStore } from "@hiway/stores/logs";
import { atuhCheck } from "./utils";
import axios from "@axios";

import routes from "~pages";
import {
  getToken,
  removeToken,
  getIsBeforeRemoveToken,
  removeIsBeforeRemoveToken,
} from "@hiway/utils/token";
import EventHandler from "@hiway/utils/eventHandler";
import Sso from "../components/Sso.vue";

// ✅ camera 모달 상태 전역 관리용 pinia store
import { useCameraModalStore } from "@/stores/cameraModal";

let isMfeLoaded = false;

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: (to) => {
        if (getToken()) return { name: "dashboard" };

        return { name: "login", query: to.query };
      },
    },
    {
      path: "/sso",
      name: "sso",
      component: Sso,
      meta: {
        layout: "blank",
        noAuth: true,
      },
    },
    ...setupLayouts(routes),
  ],
});

router.beforeEach((to, from, next) => {
  const cameraModal = useCameraModalStore();

  cameraModal.close();

  if (isMfeLoaded) {
    atuhCheck(to, from, next);
  } else {
    EventHandler.once(() => {
      isMfeLoaded = true;
      next(to.path);
    }, "mfeLoaded");
  }
});

router.afterEach((to, from) => {
  const logStore = useLogsStore();

  logStore.setCurrentRoute(to);
});

// 서버 타입 확인 후 MFE 라우팅 동적 추가
const serverType = async () => {
  const loc = document.location;

  // return await axios.get(loc.origin + '/dashboard.vue').then(response => response.headers)
  return await axios
    .get(loc.origin + "/index.html")
    .then((response) => response.headers);
};

serverType()
  .then((res) => {
    if (res.server === "Apache" || res.server === undefined) {
      console.log("internal");

      // eslint-disable-next-line import/no-unresolved
      const remoteCall = () => import("remote_app/managerList");

      remoteCall()
        // eslint-disable-next-line promise/no-nesting
        .then((res) => {
          [...setupLayouts(res.default)].forEach((mfeRoute) => {
            router.addRoute(mfeRoute);
          });
        })
        // eslint-disable-next-line promise/no-nesting
        .catch(() => {
          console.error(
            "Micro Frontend Error: 관리 페이지를 로드하는데 문제가 있습니다. HDxBuilder Web 운영팀에 문의하세요."
          );
        });
    }
  })
  .catch(() => {
    // silent fail
  })
  .finally(() => {
    EventHandler.emit("mfeLoaded");
    console.log("mfeLoaded");
  });

export default router;
