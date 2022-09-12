<template>
  <el-header>
    <hamburger class="hamburger-container" :is-active="hamburgerToggle" :class="{ toggled: hamburgerToggle }"></hamburger>
      <div class="storage" @click="popProjectModal()" :class="{ xshidden: hamburgerToggle === false }">
        <div class="storage-icon">
          Project
        </div>
        <div class="storage-value">{{ project !== null ? project.name : "not set" }}</div>
      </div>
  </el-header>
</template>

<script>
  import Hamburger from "./Hamburger.vue";
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { mapGetters, mapActions } from "vuex";
  import { Header, Popover, Button, Select, Option } from "element-ui";
  import { bus } from "../app";

  export default {
    components: {
      "hamburger": Hamburger,
      "font-awesome-icon": FontAwesomeIcon,
      "el-header": Header,
      "el-popover": Popover,
      "el-button": Button,
      "el-select": Select,
      "el-option": Option
    },
    data() {
      return {
        hamburger_toggle: false
      };
    },
    computed: {
      ...mapGetters({ hamburgerToggle: "leftbarIsCollapsed", project: "project" })
    },
    methods: {
      ...mapActions({ toggleLeftBar: "toggleLeftBar" }),
      popProjectModal: function(script) {
        bus.$emit("project-modal-toggle");
      }
    },
    mounted() {
    }
  };
</script>


<style lang="less" scoped>
  @import "../styles/styles";

  @hamburger-collapsed-margin: 54px;

  .spaceInfos {
    margin: 10px 0px 0px 0px;

    .label {
      font-weight: bold;
    }
  }

  .xshidden {
    @media (max-width: 767px) {
      display: none;
    }
  }

  .el-header {
    background-color: @topbar-background-color;
    text-align: left;
    position: fixed;
    top: 0;
    left: 0px;
    width: 100vw;
    z-index: 9;
    padding: 0px 15px 0px 20px;

    .hamburger-container {
      line-height: @topbar-height;
      height: @topbar-height;
      vertical-align: middle;
      padding: 0;
      transition: all 0.3s;
      display: inline-block;

      &:not(.toggled) {
        margin-left: @sidenav-width;

        @media (min-width: 768px) {
          margin-left: @sidenav-width - 40px;
        }

        @media (min-width: 807px) {
          margin-left: @sidenav-width;
        }
      }

      &.toggled {
        @media (max-width: 767px) {
          margin-left: -8px;
        }

        @media (min-width: 768px) {
          margin-left: @hamburger-collapsed-margin;
        }
      }

      svg {
        fill: white;
      }
    }

    .el-dropdown {
      line-height: @topbar-height;
      height: @topbar-height;
      font-size: 16px;
      color: @default-light-font-color;
    }

    .record-indicator {
      color: red;
      float: right;
      height: 60px;
      line-height: 60px;
      margin-right: 20px;
      font-weight: 100;
    }

    .storage {
      float: right;
      border: white solid 2px;
      border-radius: 5px;
      margin-top: 15px;
      margin-bottom: 15px;
      cursor: pointer;

      .storage-icon {
        background-color: white;
        color: @primary-color-2;
        display: inline-block;
        padding: 3px 4px 1px 3px;
        height: 22px;
        line-height: 22px;
      }

      .storage-value {
        display: inline-block;
        color: white;
        padding: 0px 5px 0px 5px;
        margin-left: -4px;
      }
    }
  }
</style>
