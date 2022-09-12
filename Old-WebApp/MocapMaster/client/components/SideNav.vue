<template>
  <el-aside :width="asideWidth" :class="{'collapsed': isCollapsed}">
    <el-menu class="el-menu-vertical-demo" id="sidenav" :router="true" :default-active="$route.path">
      <div class="sidebar-header" :class="{ 'sidebar-header--collapse': isHeaderCollapsed }">
        <div v-if="!isHeaderCollapsed" class="solidanim-brand">
          <img src="/assets/images/SolidAnim_Logo-noir-fond-blanc-1.png" width="200" height="41">
          <h3>{{ hostname }}</h3>
        </div>
        <img src="/assets/images/cropped-logo.png" width="40" height="40" class="solidanim-logo">
      </div>
      <template v-for="rule in $router.options.routes">
        <el-menu-item v-if="rule.display" @click="onClick()" :key="rule.path" :index="rule.path">
          <font-awesome-icon :icon="['fas', rule.icon]" fixed-width class="nav-icon" />
          <span v-if="!isCollapsed">{{ rule.title }}</span>
        </el-menu-item>
      </template>
      <div class="application-version">
        <span class="version-span">
          v[AIV]{version}[/AIV]
        </span>
      </div>
      <!-- <el-popover placement="left-start" trigger="click" width="120" class="informations" :class="{collapsed: isCollapsed}">
        <div slot="reference">
          <div class="informations-toggler">
            <font-awesome-icon :icon="['fas', 'cog']" size="lg" />
          </div>
        </div>
      </el-popover> -->
    </el-menu>
  </el-aside>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { bus } from "../app";
  import { mapGetters } from "vuex";
  import { Aside, Menu, MenuItem, Popover } from "element-ui";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "el-aside": Aside,
      "el-menu": Menu,
      "el-menu-item": MenuItem,
      "el-popover": Popover
    },
    data() {
      return {
        path: this.$route.path,
        isHeaderCollapsed: false
      };
    },
    computed: {
      ...mapGetters({
        isCollapsed: "leftbarIsCollapsed",
        hostname: "hostname"
      }),
      asideWidth: function() {
        return this.isCollapsed ? "62px" : "250px";
      }
    },
    methods: {
      onClick: function() {
        if (window.innerWidth < 768 && this.isCollapsed === false) {
          this.$store.dispatch("toggleLeftbar");
          this.isHeaderCollapsed = true;
        }
      }
    },
    filters: {
      capitalize: function(value) {
        if (!value) return "";
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    created() {
      bus.$on("sidenav-toggle", obj => {
        this.$store.dispatch("toggleLeftbar");
        this.isHeaderCollapsed = this.isCollapsed;

        if (window.innerWidth >= 768) {
        }
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  @menu-item-height: 40px;
  @font-color-default: @default-light-font-color;
  @font-color-hover: @sidenav-background-color;
  @font-color-active: @default-light-font-color;
  @background-color-default: @sidenav-background-color;
  @background-color-hover: #f5f5f5;
  @background-color-active: darken(@background-color-default, 2%);

  .application-version {
    position: absolute;
    bottom: 5px;
    left: 11px;
  }

  .informations {
    text-align: right;
    color: @default-light-font-color;
    position: fixed;
    bottom: 10px;
    transition: 0.3s all;

    @media (max-height: 250px) {
      visibility: hidden;
    }

    &:not(.collapsed) {
      left: 215px;
    }

    &.collapsed {
      left: 20px;
    }
  }

  .informations-toggler {
    cursor: pointer;
  }

  .el-aside {
    position: fixed;
    top: 0;
    z-index: 10;
    transition: all 0.3s;
    width: 250px;

    &:not(.collapsed) {
      left: 0;
    }

    &.collapsed {
      @media (max-width: 767px) {
        left: -250px;
      }
      @media (min-width: 768px) {
        width: 62px;
      }
    }

    .el-menu {
      height: 100vh;
      background-color: @background-color-default;
      width: inherit;

      .version-span {
        float: right;
        color: @default-light-font-color;
        margin-right: 10px;
      }

      .sidebar-header {
        background-color: @background-color-active;
        color: @font-color-default;
        transition: all 0.3s !important;
        margin-bottom: 10px;
        overflow: hidden;

        &:not(.sidebar-header--collapse) {
          height: 120px;
          line-height: 120px;
        }

        &.sidebar-header--collapse {
          @media (max-width: 767px) {
            height: 120px;
            line-height: 120px;
          }
          @media (min-width: 768px) {
            height: 60px;
            line-height: 60px;
          }
        }

        .solidanim-brand {
          margin-left: 25px;
          margin-top: 30px;
          height: 120px;
          line-height: 15px;
        }

        .solidanim-logo {
          margin-top: 10px;
          margin-left: 10px;
        }

        h3 {
          font-size: 18px;
          text-align: left;
          margin-top: 0;
        }
      }

      .el-menu-item {
        height: @menu-item-height;
        line-height: @menu-item-height;
        color: @font-color-default;
        font-size: 1.1em;

        &:hover {
          background-color: @background-color-hover;
          color: @font-color-hover;
        }

        &.is-active {
          background-color: @background-color-active !important;
          color: @font-color-active;
        }

        .nav-icon {
          margin-right: 10px;
        }
      }
    }
  }
</style>
