<template>
    <el-card shadow="hover" class="list-card">
        <table ref="multipleTableRef">
            <thead class='script-table-head'>
                <tr>
                    <th>
                        Notifications<el-button @click="this.show = !this.show;" class="add-project-btn">
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
                <tbody style="display: flex; vertical-align: middle; position: relative;">
                    <ul>
                        <el-alert center show-icon type="error" effect="dark" v-for="notif in notifications">
                            {{ notif }}
                        </el-alert>
                    </ul>
                </tbody>
            </div>
        </table>
    </el-card>
</template>
<script>

export default {
    name: 'Notifications',
    data() {
        return {
            notifications: ['Notification 1', 'Notification 2', 'Notification 3', 'Notification 4'],
            show: true,
        }
    },

}
</script>