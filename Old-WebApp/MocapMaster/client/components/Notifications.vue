<template>
  <div class="notifications">
    <el-row v-for="(notification, index) in notifications" :key="index">
      <el-col :span="24">
        <item :title="notification.title" :content="notification.content" :type="notification.type" :time="notification.time">
        </item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import Item from "./Notifications.Item.vue";

  export default {
    components: {
      "item": Item
    },
    computed: {
      ...mapGetters({
        notifications: "notified"
      })
    }
  };
</script>

<style lang="less" scoped>
  .notifications {
    margin-top: 10px;
  }
</style>
