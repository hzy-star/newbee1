// 配置常量路由
export const constantRoutes = [
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
        name: 'login',//命名路由
        meta: {
            title: '登录',
            hidden: true,
            icon: "Promotion"
        }
    },
    {
        path: '/',
        component: () => import('@/layout/index.vue'),
        name: 'layout',
        redirect: '/task/pushtask', //默认重定向到pushtask
        meta: {
            title: '',
            hidden: false,
            icon: ""
        },
        children: [
            {
                path: '/newbee',
                component: () => import('@/views/newbee/index.vue'),
                name: 'newbee',
                meta: {
                    title: 'HOMEPAGE',
                    hidden: false,
                    icon: "Promotion"
                },
            },
        ]
    },
    {
        path: '/task',
        component: () => import('@/layout/index.vue'),
        name: 'task',
        redirect: '/task/pushtask',
        meta: {
            title: 'TASK',
            hidden: false,
            icon: "DataBoard"
        },
        children: [
            {
                path: '/task/pushtask',
                component: () => import('@/views/task/pushtask/index.vue'),
                name: 'Pushtask',
                meta: {
                    title: 'Pushtask',
                    icon: 'Monitor',
                    hidden: false
                }
            },
            {
                path: '/task/pulltask',
                component: () => import('@/views/task/pulltask/index.vue'),
                name: 'Pulltask',
                meta: {
                    title: 'pulltask',
                    icon: 'DataLine',
                    hidden: true
                }
            },
            {
                path: '/task/autotask',
                component: () => import('@/views/task/autotask/index.vue'),
                name: 'Autotask',
                meta: {
                    title: 'Autotask',
                    icon: 'Notification',
                    hidden: false
                }
            },
            {
                path: '/task/autopkgtask',
                component: () => import('@/views/task/autopkgtask/index.vue'),
                name: 'Autopkgtask',
                meta: {
                    title: 'autopkgtask',
                    icon: 'DataLine',
                    hidden: false
                }
            },
            {
                path: '/task/devicequery',
                component: () => import('@/views/task/devicequery/index.vue'),
                name: 'devicequery',
                meta: {
                    title: 'RTADataMonitor',
                    icon: 'DataLine',
                    hidden: false
                }
            },
        ]
    },
    {
        path: '/traffic',
        component: () => import('@/layout/index.vue'),
        name: 'traffic',
        redirect: '/traffic/pushtaskchart',
        meta: {
            title: 'TRAFFIC',
            hidden: false,
            icon: "DataAnalysis"
        },
        children: [
            {
                path: '/traffic/pushtaskchart',
                component: () => import('@/views/traffic/pushtaskchart/index.vue'),
                name: 'pushtaskchart',
                meta: {
                    title: 'pushtaskchart',
                    icon: 'Connection',
                    hidden: false
                }
            },
            {
                path: '/traffic/pulltaskchart',
                component: () => import('@/views/traffic/pulltaskchart/index.vue'),
                name: 'Pulltaskchart',
                meta: {
                    title: 'pulltaskchart',
                    icon: 'Discount',
                    hidden: false
                }
            },
            {
                path: '/traffic/deviceChart',
                component: () => import('@/views/traffic/deviceChart/index.vue'),
                name: 'deviceChart',
                meta: {
                    title: 'deviceChart',
                    icon: 'SetUp',
                    hidden: false
                }
            },
            {
                path: '/traffic/deviceDup',
                component: () => import('@/views/traffic/deviceDup/index.vue'),
                name: 'deviceDup',
                meta: {
                    title: 'deviceDup',
                    icon: 'DocumentCopy',
                    hidden: false
                }
            },
            {
                path: '/traffic/pullDevice',
                component: () => import('@/views/traffic/pullDevice/index.vue'),
                name: 'pullDevice',
                meta: {
                    title: 'pullDevice',
                    icon: 'Files',
                    hidden: false
                }
            },
            {
                path: '/traffic/gAgencyToStoreRate',
                component: () => import('@/views/traffic/gAgencyToStoreRate/index.vue'),
                name: 'gAgencyToStoreRate',
                meta: {
                    title: 'gAgencyToStoreRate',
                    icon: 'DocumentCopy',
                    hidden: false
                }
            },
            {
                path: '/traffic/trafficStatistics',
                component: () => import('@/views/traffic/trafficStatistics/index.vue'),
                name: 'trafficStatistics',
                meta: {
                    title: 'trafficStatistics',
                    icon: 'OfficeBuilding',
                    hidden: false
                }
            },
        ]
    },
    {
        path: '/setting',
        component: () => import('@/layout/index.vue'),
        name: 'setting',
        redirect: '/setting/filterRule',
        meta: {
            title: 'setting',
            hidden: false,
            icon: "Setting"
        },
        children: [
            {
                path: '/setting/filterRule',
                component: () => import('@/views/setting/filterRule/index.vue'),
                name: 'filterRule',
                meta: {
                    title: 'filterRule',
                    icon: 'Filter',
                    hidden: false
                }
            },
            {
                path: '/setting/KvConfig',
                component: () => import('@/views/setting/KvConfig/index.vue'),
                name: 'KvConfig',
                meta: {
                    title: 'KvConfig',
                    icon: 'EditPen',
                    hidden: false
                }
            },
            {
                path: '/setting/advtrafficSplit',
                component: () => import('@/views/setting/advtrafficSplit/index.vue'),
                name: 'AdvtrafficSplit',
                meta: {
                    title: 'advtrafficSplit',
                    icon: 'HelpFilled',
                    hidden: false
                }
            },
            {
                path: '/setting/user',
                component: () => import('@/views/setting/user/index.vue'),
                name: 'User',
                meta: {
                    title: 'User',
                    icon: 'User',
                    hidden: false
                }
            },
            {
                path: '/setting/UserManagement',
                component: () => import('@/views/setting/UserManagement/index.vue'),
                name: 'UserManagement',
                meta: {
                    title: 'UserManagement',
                    icon: 'UserFilled',
                    hidden: false
                }
            },
        ]
    },
]

//动态路由
export const asnycRoute = [
    
    {
        path: '/product',
        component: () => import('@/layout/index.vue'),
        name: 'Product',
        redirect: '/product/trademark',
        meta: {
            title: '商品管理',
            icon: 'ShoppingCartFull',
            hidden: false
        },
        children: [
            {
                path: '/product/trademark',
                component: () => import('@/views/product/trademark/index.vue'),
                name: 'Trademark',
                meta: {
                    title: '品牌管理',
                    icon: 'Goods',
                    hidden: false
                }
            },
            {
                path: '/product/attr',
                component: () => import('@/views/product/attr/index.vue'),
                name: 'Attr',
                meta: {
                    title: '属性管理',
                    icon: 'SetUp',
                    hidden: false
                }
            },
            {
                path: '/product/spu',
                component: () => import('@/views/product/spu/index.vue'),
                name: 'Spu',
                meta: {
                    title: 'Spu管理',
                    icon: 'Calendar',
                    hidden: false
                }
            },
            {
                path: '/product/sku',
                component: () => import('@/views/product/sku/index.vue'),
                name: 'Sku',
                meta: {
                    title: 'Sku管理',
                    icon: 'ScaleToOriginal',
                    hidden: false
                }
            }
        ]
    },
    {
        path: '/acl',
        component: () => import('@/layout/index.vue'),
        name: 'aclUser',
        redirect: '/acl/user',
        meta: {
            title: '权限管理',
            hidden: false,
            icon: "User"
        },
        children: [
            {
                path: '/acl/user',
                component: () => import('@/views/acl/user/index.vue'),
                name: 'Acl',
                meta: {
                    title: '用户管理',
                    hidden: false,
                    icon: "HomeFilled"
                }
            },
            {
                path: '/acl/role',
                component: () => import('@/views/acl/role/index.vue'),
                name: 'Role',
                meta: {
                    title: '角色管理',
                    hidden: false,
                    icon: "UserFilled"
                }
            },
            {
                path: '/acl/permission',
                component: () => import('@/views/acl/permission/index.vue'),
                name: 'Permission',
                meta: {
                    title: '菜单管理',
                    hidden: false,
                    icon: "Memo"
                }
            }
        ]
    },
]
//任意路由
export const anyRoute = {
  //任意路由
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  name: 'Any',
  meta: {
    title: '任意路由',
    hidden: true,
    icon: 'DataLine',
  },
}