<template>
  <aside class="right-aside" :style="(!isCollapsed) ? expandedNav : 'right: 0;'">
    <ul class="menu">
      <toggler :is-active="!isCollapsed" :name="toggler.name" v-on:nav-toggle="toggleNav"></toggler>
      <item v-for="item in items" :key="item.name" :is-active="item.isActive" :name="item.name" :icon="item.icon" :popper-text="item.popperText" :notification="item.notification" v-on:item-toggle="selectItem"></item>
    </ul>
    <div class="rightbar-content" :style="(!isCollapsed) ? expandedContent : hiddenContent">
      <div v-if="selectedItem" class="content-header">{{ items[selectedItem].contentHeader }}</div>
      <notifications v-if="selectedItem == 'notifications'" class="notifications"></notifications>
    </div>
  </aside>
</template>

<script>
  import { mapGetters, mapActions } from "vuex";
  import Item from "./RightNav.Item.vue";
  import Toggler from "./RightNav.Toggler.vue";

  const Notifications = () => import("./Notifications.vue");

  export default {
    components: {
      "item": Item,
      "toggler": Toggler,
      "notifications": Notifications
    },
    data() {
      return {
        windowWidth: window.innerWidth,
        width: "40px",
        headerTitle: "Mocap Helmet",
        selectedItem: null,
        toggler: {
          name: "toggler",
          activeIcon: "angle-double-right",
          inactiveIcon: "angle-double-left"
        }
      };
    },
    computed: {
      ...mapGetters({
        isCollapsed: "rightbarIsCollapsed",
        hasUnseenNotifications: "hasUnseenNotifications"
      }),
      items: function() {
        return {
          notifications: {
            name: "notifications",
            icon: "bell",
            isActive: false,
            contentHeader: "Notifications",
            popperText: "Notifications",
            notification: this.hasUnseenNotifications,
            onClick: () => this.toggleNotifications()
          }
        };
      },
      expandedNav: function() {
        return {
          right: this.windowWidth > 767 ? "400px" : this.windowWidth - 40 + "px"
        };
      },
      expandedContent: function() {
        return {
          right: 0,
          width: this.windowWidth > 767 ? "400px" : this.windowWidth - 40 + "px"
        };
      },
      hiddenContent: function() {
        return {
          right:
            this.windowWidth > 767
              ? "-400px"
              : -this.windowWidth + 62 + 40 + "px",
          width:
            this.windowWidth > 767 ? "400px" : this.windowWidth - 62 - 40 + "px"
        };
      }
    },
    methods: {
      ...mapActions(["toggleRightbar"]),
      selectItem(name) {
        if (this.$store.state.rightbarIsCollapsed) {
          this.$store.dispatch("setToggleRightbar", true);
        } else {
          if (this.selectedItem === name) {
            this.$store.dispatch("setToggleRightbar", false);
            return;
          }
        }

        this.deselectPreviousItem();
        this.items[name].isActive = true;
        this.selectedItem = name;

        if (this.items[this.selectedItem].onClick !== undefined) {
          this.items[this.selectedItem].onClick.call();
        }
      },
      deselectPreviousItem() {
        if (this.selectedItem) {
          this.items[this.selectedItem].isActive = false;
        }
      },
      toggleNav(name) {
        this.$store.dispatch("toggleRightbar");

        if (!this.$store.state.rightbarIsCollapsed) {
          if (!this.selectedItem) {
            this.selectedItem = "notifications";
          }

          this.items[this.selectedItem].isActive = true;

          if (this.items[this.selectedItem].onClick !== undefined) {
            this.items[this.selectedItem].onClick.call();
          }
        } else if (this.selectedItem) {
          this.items[this.selectedItem].isActive = false;
        }
      },
      toggleNotifications() {
        this.$store.dispatch("setHasUnseenNotifications", false);
      }
    },
    mounted() {
      let that = this;

      if (!this.$store.state.rightbarIsCollapsed) {
        this.selectedItem = "notifications";
        this.items["notifications"].isActive = true;
      }

      this.$nextTick(function() {
        window.addEventListener("resize", function(e) {
          that.windowWidth = window.innerWidth;
        });
      });
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

  .right-aside {
    position: fixed;
    z-index: 2;
    top: @topbar-height;
    right: 0;
    width: 40px;
    height: 100vh;
    background-color: @background-color-default;
    border-left: 1px solid #a5a5a5;
    transition: all 0.3s;

    .menu {
      margin: 0;
      padding: 0;
    }
  }

  .rightbar-content {
    overflow: auto;
    position: fixed;
    top: @topbar-height;
    z-index: 9999;
    transition: all 0.3s;
    width: 400px;
    height: 100vh;
    right: -400px;
    font-size: 1.1em;
    background-color: lighten(@background-color-default, 10%);

    .content-header {
      width: 100vw;
      background-color: mix(darken(@background-color-default, 20%), black, 80%);
      line-height: @menu-item-height;
      padding-left: 20px;
      color: @default-light-font-color;
    }

    .player {
      margin: 20px;
    }
  }
</style>
