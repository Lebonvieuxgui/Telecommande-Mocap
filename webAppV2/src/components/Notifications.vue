<template>
  <el-badge :type="badgeType" v-if="this.notifications.length > 0" value="ㅤ">
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef">
      <thead class="script-table-head">
        <tr>
          <th>
            Notifications<el-button @click="this.show = !this.show" class="deploy-component-btn">
              <span v-if="!show">
                <el-icon>
                  <Plus />
                </el-icon>
              </span>
              <span v-else>
                <el-icon>
                  <Minus />
                </el-icon>
              </span>
            </el-button>
          </th>
        </tr>
      </thead>
      <div v-if="show" class="script-table-body">
        <tbody style="display: flex; vertical-align: middle; position: relative">
          <ul>
            <el-alert center show-icon effect="dark" v-for="notif in notifications" :type=notif.type>
              {{ notif.name }}
            </el-alert>
          </ul>
        </tbody>
      </div>
    </table>
  </el-card>
</el-badge>
</template>
<script>
export default {
  name: "Notifications",
  data() {
    return {
      activeNotifications: [
        {
          name: "Notification 1",
          type: "info"
        },
        {
          name: "Notification 2",
          type: "warning"
        },
        {
          name: "Notification 3",
          type: "success"
        },
        {
          name: "Notification 4",
          type: "success"
        },
      ],
      show: true,
      badgeType: "success",
    };
  },
  created() {
    this.emitter.on("newNotif", () => {
      this.badgeTypeSelect();
    })
  },
  methods: {
    badgeTypeSelect() {
      for (let i in this.activeNotifications) {
        if (this.activeNotifications[i].type === "error") {
          this.badgeType = "danger";
          return "danger";
        }
      }
      this.badgeType = "success";
      return "success";
    }
  },
  computed: {
    notifications() {
      this.badgeTypeSelect();
      return this.activeNotifications
    }
  }
};
</script>
