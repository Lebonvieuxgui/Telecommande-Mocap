<template>
  <el-badge :type="badgeType" v-if="this.notifications.length > 0" :value="errorNotifications">
    <el-card shadow="hover" class="list-card">
      <table ref="multipleTableRef">
        <thead class="script-table-head">
          <tr>
            <th>
              Notifications<el-button @click="this.show = !this.show, sendResize()" class="deploy-component-btn">
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
              <el-alert center show-icon effect="dark" v-for="notif in notifications" :type="notif.type" @close="deleteNotif(notif)" :style="width=100">
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
      ],
      show: true,
      badgeType: "success",
      badNotifs: "0"
    };
  },
  created() {
    this.emitter.on("newNotif", () => {
      this.badgeTypeSelect();
    }),
    this.emitter.on("errorNotification", (evt) => {
      this.receivedNotif(evt);
    })
  },
  methods: {
    sendResize() {
      this.emitter.emit("resizeCard", "Notifications");
    },
    receivedNotif(evt) {
      let newNotif = {
        name: evt.name,
        type: evt.type,
        index: this.activeNotifications.length + 1
      }
      this.activeNotifications.push(newNotif);
    },
    addNotif() {
      let newNotif = {
        name: "prout",
        type: "error",
        index: this.activeNotifications.length + 1
      };
      this.activeNotifications.push(newNotif);
    },
    deleteNotif(notif) {
      this.activeNotifications.splice(notif.index - 1, 1)
      for (let i = notif.index - 1; i < this.activeNotifications.length; i++) {
        this.activeNotifications[i].index--;
      }
    },
    badgeTypeSelect() {
      for (let i in this.activeNotifications) {
        if (this.activeNotifications[i].type === "error") {
          this.badgeType = "danger";
          return "danger";
        }
      }
      this.badgeType = "success";
      return "success";
    },
    errorNotificationsCount() {
      let count = 0;
      for (let i in this.activeNotifications) {
        if (this.activeNotifications[i].type === "error") {
          count++;
        }
      }
      console.log(count);
      return count;
    }
  },
  computed: {
    notifications() {
      this.badgeTypeSelect();
      return this.activeNotifications
    },
    errorNotifications() {
      let count = this.errorNotificationsCount();
      if (count > 0) {
        this.badNotif = count;
        console.log(count)
        return count;
      }
      else {
        this.badNotif = "ㅤ"
        return this.badNotif;
      }
    },
  }
};
</script>
