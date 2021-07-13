<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="" />
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <el-container>
            <!-- 侧边栏区域 -->

            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="collapseBtn" @click="toggleCollapse">|||</div>
                <el-menu
                    class="el-menu-vertical-demo"
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409EFF"
                    unique-opened
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    :default-active="activePath"
                >
                    <el-submenu
                        :index="item.id + ''"
                        v-for="item in menulist"
                        :key="item.id"
                    >
                        <!-- 一级菜单 -->
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item
                            :index="'/' + subitem.path"
                            v-for="subitem in item.children"
                            :key="subitem.id"
                            @click="saveNavState('/' + subitem.path)"
                        >
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{ subitem.authName }}</span></template
                            >
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容 -->
            <el-main>
                <router-view> </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            // 左侧菜单数据
            menulist: [],
            iconObj: {
                '125': 'el-icon-s-custom',
                '103': 'el-icon-s-management',
                '101': 'el-icon-s-shop',
                '102': 'el-icon-s-order',
                '145': 'el-icon-s-data'
            },
            isCollapse: false,
            // 被激活的链接地址
            activePath: ''
        }
    },
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        // 退出之后清除 token
        logout() {
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        // 获得表单数据
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200)
                return this.$message.error(res.meta.msg)
            this.menulist = res.data
            //   if (res.meta.status !== 200)
            //     return this.$message.error(res.meta.msg)
            //   this.menulist = res.data
            console.log(res)
        },
        // 切换菜单页的折叠
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 点击菜单栏的路径之后就 就将该菜单的 index 值存储在本地对话中
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        }
    }
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: 0;
    }
}
.el-main {
    background-color: #eaedf1;
}
.collapseBtn {
    background-color: #4a5064;
    text-align: center;
    line-height: 24px;
    color: #fff;
    font-weight: 600;
    letter-spacing: 0.2em;
    cursor: pointer;
    font-size: 10px;
}
</style>
