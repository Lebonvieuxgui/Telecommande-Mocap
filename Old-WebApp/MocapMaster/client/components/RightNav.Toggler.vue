<template>
  <li class="menu-item" @click="select">
    <font-awesome-icon v-if="isActive" :icon="['fas', activeIcon]" fixed-width class="nav-icon" />
    <font-awesome-icon v-else :icon="['fas', inactiveIcon]" fixed-width class="nav-icon" />
  </li>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon
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
      activeIcon: {
        type: String,
        default: "angle-double-right"
      },
      inactiveIcon: {
        type: String,
        default: "angle-double-left"
      },
      popperText: {
        type: String,
        default: "undefined"
      }
    },
    data() {
      return {};
    },
    methods: {
      select: function() {
        this.$emit("nav-toggle", this.name);
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
  }
</style>

