<template>
  <li class="menu-item" :class="{'is-active':isActive}" @click="select">
    <el-badge is-dot :hidden="!notification">
      <el-tooltip class="item" popper-class="tooltip-item" effect="dark" :content="popperText" placement="left">
        <font-awesome-icon :icon="['fas', icon]" fixed-width class="nav-icon" />
      </el-tooltip>
    </el-badge>
  </li>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { Badge, Tooltip } from "element-ui";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "el-badge": Badge,
      "el-tooltip": Tooltip
    },
    props: {
      isActive: {
        type: Boolean,
        default: false
      },
      name: {
        type: String,
        default: ""
      },
      icon: {
        type: String,
        default: ""
      },
      popperText: {
        type: String,
        default: "undefined"
      },
      notification: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        arrowStyle: {
          marginBottom: "10px"
        }
      };
    },
    methods: {
      select: function() {
        this.$emit("item-toggle", this.name);
      }
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  @menu-item-height: 40px;
  @font-color-default: @default-dark-font-color;
  @font-color-hover: @default-dark-font-color;
  @font-color-active: @default-dark-font-color;
  @background-color-default: @rightnav-background-color;
  @background-color-hover: @rightnav-background-color;
  @background-color-active: lighten(@background-color-default, 10%);
  @tooltip-background-color: darken(white, 70%);
  @tooltip-font-color: @default-light-font-color;

  div {
    font-family: "Poppins";
  }

  .menu-item {
    height: @menu-item-height;
    line-height: @menu-item-height;
    color: @font-color-default;
    font-size: 1.1em;
    padding: 0 9px !important;
    list-style-type: none;
    cursor: pointer;

    &:hover {
      background-color: @background-color-hover;
      color: @font-color-hover;
    }

    &.is-active {
      background-color: @background-color-active !important;
      color: @font-color-active;
      box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
    }

    .el-tooltip__popper {
      font-family: "Poppins";
    }
  }
</style>

