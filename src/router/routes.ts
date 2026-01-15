// 配置常量路由
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    name: "login", //命名路由
    meta: {
      title: "登录",
      hidden: true,
      icon: "Promotion",
    },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    name: "layout",
    redirect: "/task/pushtask", //默认重定向到pushtask
    meta: {
      title: "",
      hidden: false,
      icon: "",
    },
    children: [
      {
        path: "/newbee",
        component: () => import("@/views/newbee/index.vue"),
        name: "newbee",
        meta: {
          title: "HOMEPAGE",
          hidden: false,
          icon: "Promotion",
        },
      },
    ],
  },
  {
    path: "/task",
    component: () => import("@/layout/index.vue"),
    name: "task",
    redirect: "/task/pushtask",
    meta: {
      title: "TASK",
      hidden: false,
      icon: "DataBoard",
    },
    children: [
      {
        path: "/task/pushtask",
        component: () => import("@/views/task/pushtask/index.vue"),
        name: "Pushtask",
        meta: {
          title: "Pushtask",
          icon: "Monitor",
          hidden: false,
        },
      },
      {
        path: "/task/pushtask1",
        component: () => import("@/views/task/pushtask1/index.vue"),
        name: "Pushtask1",
        meta: {
          title: "Pushtask1",
          icon: "Monitor",
          hidden: true,
        },
      },
      {
        path: "/task/pulltask",
        component: () => import("@/views/task/pulltask/index.vue"),
        name: "Pulltask",
        meta: {
          title: "pulltask",
          icon: "DataLine",
          hidden: true,
        },
      },
      {
        path: "/task/autotask",
        component: () => import("@/views/task/autotask/index.vue"),
        name: "Autotask",
        meta: {
          title: "Autotask",
          icon: "Notification",
          hidden: false,
        },
      },
      {
        path: "/task/autopkgtask",
        component: () => import("@/views/task/autopkgtask/index.vue"),
        name: "Autopkgtask",
        meta: {
          title: "Autopkgtask",
          icon: "DataLine",
          hidden: false,
        },
      },
      {
        path: "/task/devicequery",
        component: () => import("@/views/task/devicequery/index.vue"),
        name: "devicequery",
        meta: {
          title: "RtaDataMonitor",
          icon: "DataLine",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/traffic",
    component: () => import("@/layout/index.vue"),
    name: "traffic",
    redirect: "/traffic/pushtaskchart",
    meta: {
      title: "TRAFFIC",
      hidden: false,
      icon: "DataAnalysis",
    },
    children: [
      {
        path: "/traffic/pushtaskchart",
        component: () => import("@/views/traffic/pushtaskchart/index.vue"),
        name: "pushtaskchart",
        meta: {
          title: "PushTaskChart",
          icon: "Connection",
          hidden: false,
        },
      },
      {
        path: "/traffic/pulltaskchart",
        component: () => import("@/views/traffic/pulltaskchart/index.vue"),
        name: "Pulltaskchart",
        meta: {
          title: "PullTaskChart",
          icon: "Discount",
          hidden: true,
        },
      },
      {
        path: "/traffic/deviceChart",
        component: () => import("@/views/traffic/deviceChart/index.vue"),
        name: "deviceChart",
        meta: {
          title: "DeviceChart",
          icon: "SetUp",
          hidden: false,
        },
      },
      {
        path: "/traffic/deviceDup",
        component: () => import("@/views/traffic/deviceDup/index.vue"),
        name: "deviceDup",
        meta: {
          title: "DeviceDup",
          icon: "DocumentCopy",
          hidden: false,
        },
      },
      {
        path: "/traffic/pkgTaskChart",
        component: () => import("@/views/traffic/pkgTaskChart/index.vue"),
        name: "pkgTaskChart",
        meta: {
          title: "PkgTaskChart",
          icon: "Tickets",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/strategyAutoDelivery",
    component: () => import("@/layout/index.vue"),
    name: "strategyAutoDelivery",
    redirect: "/strategyAutoDelivery/algConfig",
    meta: {
      title: "算法平台",
      icon: "DocumentCopy",
      hidden: false,
    },
    children: [
      {
        path: "/strategyAutoDelivery/algConfig",
        component: () =>
          import("@/views/strategyAutoDelivery/algConfig/index.vue"),
        name: "algConfig",
        meta: {
          title: "设备筛选模块", // algconfig页面
          icon: "Coin",
          hidden: false,
        },
      },
      {
        path: "/strategyAutoDelivery/parameterModule",
        component: () =>
          import("@/views/strategyAutoDelivery/parameterModule/index.vue"),
        name: "parameterModule",
        redirect: "/parameterModule/childrenFiles/parameterAssembly",
        meta: {
          title: "参数模块",
          icon: "parameter",// SVG 文件名（不带 .svg 扩展名）
          customIcon: true,// 标记使用自定义图标
          hidden: false,
        },
        children: [
          {
            path: "/parameterModule/childrenFiles/parameterAssembly",
            component: () => import("@/views/strategyAutoDelivery/parameterModule/childrenFiles/parameterAssembly.vue"),
            name: "parameterAssembly",
            meta: {
              title: "参数装配模块",
              icon: "Document",
              hidden: false,
            },
          },
          {
            path: "/parameterModule/childrenFiles/parameterRules",
            component: () => import("@/views/strategyAutoDelivery/parameterModule/childrenFiles/parameterRules.vue"),
            name: "parameterRules",
            meta: {
              title: "参数规则模块",
              icon: "Files",
              hidden: false,
            },
          },
        ],
      },
      {
        path: "/strategyAutoDelivery/washVolume",
        component: () =>
          import("@/views/strategyAutoDelivery/washVolume/index.vue"),
        name: "washVolume",
        meta: {
          title: "自动化洗量", // algconfig页面
          icon: "Brush",
          hidden: false,
        },
      },
      {
        path: "/strategyAutoDelivery/otherConfig",
        component: () =>
          import("@/views/strategyAutoDelivery/otherConfig/index.vue"),
        name: "otherConfig",
        meta: {
          title: "其他配置", // algconfig页面
          icon: "Box",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/docDownload",
    component: () => import("@/layout/index.vue"),
    name: "docDownload",
    redirect: "/docDownload/ossDownload",
    meta: {
      title: "OSS通用平台",
      icon: "Document",
      hidden: false,
    },
    children: [
      {
        path: "/docDownload/ossDownload",
        component: () => import("@/views/docDownload/ossDownload/index.vue"),
        name: "ossDownload",
        meta: {
          title: "文件下载",
          icon: "Document",
          hidden: false,
        },
      },
      {
        path: "/docDownload/generalCsvEditing",
        component: () =>
          import("@/views/docDownload/generalCsvEditing/index.vue"),
        name: "generalCsvEditing",
        meta: {
          title: "CSV配置页面",
          icon: "briefcase",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/dataPresentation",
    component: () => import("@/layout/index.vue"),
    name: "dataPresentation",
    redirect: "/dataPresentation/dataStatistics",
    meta: {
      title: "STATISTICS",
      icon: "DataLine",
      hidden: false,
    },
    children: [
      {
        path: "/dataPresentation/dataStatistics",
        component: () =>
          import("@/views/dataPresentation/dataStatistics/index.vue"),
        name: "dataStatistics",
        meta: {
          title: "ProxyStatistics",
          icon: "DataLine",
          hidden: false,
        },
      },
      {
        path: "/dataPresentation/pullDevice",
        component: () =>
          import("@/views/dataPresentation/pullDevice/index.vue"),
        name: "pullDevice",
        meta: {
          title: "EsPullDevice",
          icon: "Files",
          hidden: true,
        },
      },
      {
        path: "/dataPresentation/gAgencyToStoreRate",
        component: () =>
          import("@/views/dataPresentation/gAgencyToStoreRate/index.vue"),
        name: "gAgencyToStoreRate",
        meta: {
          title: "AgencyStoreRate",
          icon: "DocumentCopy",
          hidden: false,
        },
      },
      {
        path: "/dataPresentation/trafficStatistics",
        component: () =>
          import("@/views/dataPresentation/trafficStatistics/index.vue"),
        name: "trafficStatistics",
        meta: {
          title: "GatewayDeviceStatistics",
          icon: "OfficeBuilding",
          hidden: false,
        },
      },
      {
        path: "/dataPresentation/syncAsyncWarn",
        component: () =>
          import("@/views/dataPresentation/syncAsyncWarn/index.vue"),
        name: "syncAsyncWarn",
        meta: {
          title: "SyncAsyncWarn",
          icon: "Warning",
          hidden: false,
        },
      },
      {
        path: "/dataPresentation/clickhouseDevice",
        component: () =>
          import("@/views/dataPresentation/clickhouseDevice/index.vue"),
        name: "clickhouseDevice",
        meta: {
          title: "ClickHouseDevice",
          icon: "Files",
          hidden: false,
        },
      },
      {
        path: "/dataPresentation/blackWhiteList",
        component: () =>
          import("@/views/dataPresentation/blackWhiteList/index.vue"),
        name: "blackWhiteList",
        meta: {
          title: "BlackWhiteList",
          icon: "Box",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/setting",
    component: () => import("@/layout/index.vue"),
    name: "setting",
    redirect: "/setting/filterRule",
    meta: {
      title: "SETTING",
      hidden: false,
      icon: "Setting",
    },
    children: [
      {
        path: "/setting/filterRule",
        component: () => import("@/views/setting/filterRule/index.vue"),
        name: "filterRule",
        meta: {
          title: "FilterRule",
          icon: "Filter",
          hidden: false,
        },
      },
      {
        path: "/setting/KvConfig",
        component: () => import("@/views/setting/KvConfig/index.vue"),
        name: "KvConfig",
        meta: {
          title: "KvConfig",
          icon: "EditPen",
          hidden: false,
        },
      },
      {
        path: "/setting/advtrafficSplit",
        component: () => import("@/views/setting/advtrafficSplit/index.vue"),
        name: "AdvtrafficSplit",
        meta: {
          title: "AdvTrafficSplit",
          icon: "HelpFilled",
          hidden: false,
        },
      },
      {
        path: "/setting/user",
        component: () => import("@/views/setting/user/index.vue"),
        name: "User",
        meta: {
          title: "User",
          icon: "User",
          hidden: false,
        },
      },
      {
        path: "/setting/UserManagement",
        component: () => import("@/views/setting/UserManagement/index.vue"),
        name: "UserManagement",
        meta: {
          title: "UserManagement",
          icon: "UserFilled",
          hidden: false,
        },
      },
    ],
  },
];

//动态路由
export const asnycRoute = [
  {
    path: "/product",
    component: () => import("@/layout/index.vue"),
    name: "Product",
    redirect: "/product/trademark",
    meta: {
      title: "商品管理",
      icon: "ShoppingCartFull",
      hidden: false,
    },
    children: [
      {
        path: "/product/trademark",
        component: () => import("@/views/product/trademark/index.vue"),
        name: "Trademark",
        meta: {
          title: "品牌管理",
          icon: "Goods",
          hidden: false,
        },
      },
      {
        path: "/product/attr",
        component: () => import("@/views/product/attr/index.vue"),
        name: "Attr",
        meta: {
          title: "属性管理",
          icon: "SetUp",
          hidden: false,
        },
      },
      {
        path: "/product/spu",
        component: () => import("@/views/product/spu/index.vue"),
        name: "Spu",
        meta: {
          title: "Spu管理",
          icon: "Calendar",
          hidden: false,
        },
      },
      {
        path: "/product/sku",
        component: () => import("@/views/product/sku/index.vue"),
        name: "Sku",
        meta: {
          title: "Sku管理",
          icon: "ScaleToOriginal",
          hidden: false,
        },
      },
    ],
  },
  {
    path: "/acl",
    component: () => import("@/layout/index.vue"),
    name: "aclUser",
    redirect: "/acl/user",
    meta: {
      title: "权限管理",
      hidden: false,
      icon: "User",
    },
    children: [
      {
        path: "/acl/user",
        component: () => import("@/views/acl/user/index.vue"),
        name: "Acl",
        meta: {
          title: "用户管理",
          hidden: false,
          icon: "HomeFilled",
        },
      },
      {
        path: "/acl/role",
        component: () => import("@/views/acl/role/index.vue"),
        name: "Role",
        meta: {
          title: "角色管理",
          hidden: false,
          icon: "UserFilled",
        },
      },
      {
        path: "/acl/permission",
        component: () => import("@/views/acl/permission/index.vue"),
        name: "Permission",
        meta: {
          title: "菜单管理",
          hidden: false,
          icon: "Memo",
        },
      },
    ],
  },
];
//任意路由
export const anyRoute = {
  //任意路由
  path: "/:pathMatch(.*)*",
  redirect: "/404",
  name: "Any",
  meta: {
    title: "任意路由",
    hidden: true,
    icon: "DataLine",
  },
};
