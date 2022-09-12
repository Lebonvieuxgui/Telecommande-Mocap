<template>
  <div>
    <el-row :gutter="30" ref="pane" style="margin-top: -20px;">
      <el-col v-for="(device, index) in devices" :key="device.ipAddress" :ref="device.ipAddress" :lg="6" :md="8" :sm="12" :xs="24">
        <div class="stream-container">
          <div class="stream">
            <div class="image-container">
              <!-- <video-player class="vjs-custom-skin" ref="videoPlayer" :options="getPlayerOptions(device)">
              </video-player> -->
              <img class="stream-image" :id="'streamedImage_' + device.ipAddress" :src="'http://' + device.ipAddress + ':3000/stream/stream.jpg?random=' + new Date().getTime()">
            </div>
            <div class="stream-infos">
              <span>{{ device.helmetName }}</span>
              <el-button type="text" @click="notify(index)" class="notify-button">
                <font-awesome-icon :icon="['fas', 'bell']" fixed-width />
              </el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";

  // import "video.js/dist/video-js.css";
  // import { videoPlayer } from "vue-video-player";
  // import "videojs-flash";
  import { Button } from "element-ui";
  import Timer from "easytimer.js";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      // "video-player": videoPlayer,
      "el-button": Button
    },
    props: {
      devices: {}
    },
    data() {
      return {
        onlyActive: true
      };
    },
    methods: {
      getPlayerOptions: function(device) {
        return {
          aspectRatio: "3:4",
          overNative: true,
          autoplay: true,
          controls: false,
          techOrder: ["flash"],
          sourceOrder: true,
          html5: { hls: { withCredentials: false } },
          sources: [
            {
              type: "rtmp/mp4",
              src: "rtmp://" + device.ipAddress + ":1935/live/picam"
            }
          ]
        };
      },
      notify: function(deviceIndex) {
        this.devices[deviceIndex].notified = true;

        setTimeout(() => {
          this.devices[deviceIndex].notified = false;
        }, 2000);
      }
    },
    created() {
      var timer = new Timer();

      let self = this;

      timer.start();
      timer.addEventListener("secondsUpdated", function(e) {
        self.devices.forEach(device => {
          document.getElementById("streamedImage_" + device.ipAddress).src = "http://" + device.ipAddress + ":3000/stream/stream.jpg?random=" + new Date().getTime();
        });
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .stream-container {
    padding-top: 20px;

    .stream {
      border: @primary-color-2 2px solid;
      box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;

      .image-container {
        margin-bottom: -7px;

        .stream-image {
          width: 100%;
        }
      }

      .stream-infos {
        width: 100%;
        background-color: @primary-color-2;
        color: @default-light-font-color;
        border-top: @primary-color-2 2px solid;
        height: 30px;
        line-height: 30px;

        span {
          margin-left: 8px;
        }

        .notify-button {
          color: @default-light-font-color;
          float: right;
          padding: 7px 5px 0px 0px;
        }
      }
    }
  }
</style>
