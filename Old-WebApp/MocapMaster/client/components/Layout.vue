<template>
  <el-container style="margin: -8px;">
    <side-nav></side-nav>
    <el-container>
      <app-header></app-header>
      <div class="dark-filter" :class="{'dark-filter--visible': !leftbarIsCollapsed}"></div>
      <el-main :class="{ 'el-main--expanded': leftbarIsCollapsed, 'right-nav-margin': !rightbarIsCollapsed }">
        <span class="current-page-title-span">
          <h4 class="current-page-title">{{$router.history.current.name}}</h4>
        </span>
        <router-view></router-view>
      </el-main>
      <right-nav></right-nav>
    </el-container>
    <project-modal></project-modal>
  </el-container>
</template>

<script>
  import AppHeader from "./AppHeader.vue";
  import SideNav from "./SideNav.vue";
  import RightNav from "./RightNav.vue";
  import { mapGetters } from "vuex";
  import { Container, Main } from "element-ui";
  import ProjectModal from "./ProjectModal.vue";

  export default {
    components: {
      "app-header": AppHeader,
      "side-nav": SideNav,
      "el-container": Container,
      "el-main": Main,
      "right-nav": RightNav,
      "project-modal": ProjectModal
    },
    data() {
      return {
        mainExpanded: false
      };
    },
    computed: {
      ...mapGetters({
        leftbarIsCollapsed: "leftbarIsCollapsed",
        rightbarIsCollapsed: "rightbarIsCollapsed",
        notifications: "notifications",
        message: "message",
        hasUnseenNotifications: "hasUnseenNotifications"
      })
    },
    watch: {
      notifications: function(val) {
        if (val.length === 0) return;

        this.$store.dispatch("clearNotifications");

        for (let index = 0; index < val.length; index++) {
          const element = val[index];

          let self = this;

          if (this.rightbarIsCollapsed === true) {
            setTimeout(function() {
              self.notify(element.title, element.desc);
            }, 200 * index);
          }
        }
      },
      message: function(message) {
        if (message === null) {
          return;
        }

        this.openMessage(message.content, message.type);
      }
    },
    methods: {
      notify(title, desc, type = "default") {
        if (window.innerWidth < 1920) {
          this.$store.dispatch("setHasUnseenNotifications", true);
          return;
        }

        const h = this.$createElement;
        let color = "#35495E";

        if (type === "success") {
          color = "teal";
        } else if (type === "error") {
          color = "red";
        }

        this.$notify({
          title: "",
          message: h("p", null, [
            h("b", { style: "color: " + color }, title),
            h("span", { style: "color: " + color }, desc)
          ]),
          offset: 60,
          customClass: "notification",
          duration: 80
        });
      },
      openMessage(content, type) {
        this.$message({
          message: content,
          type: type,
          center: true,
          showClose: true
        });
      }
    },
    mounted() {
      for (let index = 0; index < this.notifications.length; index++) {
        const element = this.notifications[index];

        let self = this;

        if (this.rightbarIsCollapsed === true) {
          setTimeout(function() {
            self.notify(element.title, element.desc);
          }, 200 * index);
        }
      }

      if (this.message !== null) {
        this.openMessage(this.message.content, this.message.type);
      }
    }
  };
</script>

<style lang="less" >
  @import "../styles/styles.less";

  @font-face {
    font-family: "Poppins";
    src: url("../../assets/fonts/Poppins-Regular.ttf") format("truetype");
    font-weight: normal;
    font-style: normal;
  }

  * {
    font-family: "Poppins";
  }

  .current-page-title {
    margin-top: 0;
    font-weight: 600;
    font-size: 20px;
    color: @primary-color-2;
  }

  .el-main {
    z-index: 1;
    transition: all 0.3s;
    @media (max-width: 767px) {
      margin-right: @main-content-margin-xs + @rightnav-collapsed-width;
      margin-top: @topbar-height + @main-content-margin-xs;
    }
    @media (min-width: 768px) {
      margin-right: @main-content-margin-md + @rightnav-collapsed-width;
      margin-top: @topbar-height + @main-content-margin-md - 10px;
    }

    &:not(.el-main--expanded) {
      @media (max-width: 767px) {
        margin-left: @main-content-margin-xs;
      }
      @media (min-width: 768px) {
        margin-left: @sidenav-width + @main-content-margin-md;
      }
    }

    &.el-main--expanded {
      @media (max-width: 767px) {
        margin-left: @main-content-margin-xs;
      }
      @media (min-width: 768px) {
        margin-left: @sidenav-collapsed-width + @main-content-margin-md;
      }
    }

    &.right-nav-margin {
      @media (max-width: 1439px) {
        display: none;
      }

      @media (min-width: 1440px) {
        margin-right: @main-content-margin-md + @rightnav-expanded-width +
          @rightnav-collapsed-width;
      }
    }
  }

  .current-page-title-span {
    display: inline-block;
    margin-bottom: 20px;

    h4 {
      border-bottom: solid 4px @primary-color-1;
      width: auto;
      padding-right: 40px;
      padding-bottom: 5px;
    }
  }

  .dark-filter {
    background-color: black;
    opacity: 0;
    top: 0;
    left: 0;
    z-index: -1;
    position: fixed;
    width: 100vw;
    height: 100vh;
    visibility: 0;

    &.dark-filter--visible {
      @media (max-width: 767px) {
        opacity: 0.7 !important;
        z-index: 3;
      }
    }
  }
</style>
