<template>
  <div class="error" :class="{ xs :isXs }">
    <div class="error-number" :class="{ xs: isXs }">
      {{404}}
    </div>
    <div class="error-description" :class="{ xs: isXs }">
      The ressource you requested was not found.
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isXs: undefined
    };
  },
  mounted() {
    if (window.innerWidth < 768) {
      this.isXs = true;
    } else {
      this.isXs = false;
    }

    this.$nextTick(() => {
      window.addEventListener("resize", () => {
        if (window.innerWidth < 768) {
          this.isXs = true;
        } else {
          this.isXs = false;
        }
      });
    });
  }
};
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .error {
    height: 200px;
    line-height: 200px;
    margin-top: 30px;

    &:not(.xs) {
      margin-left: 50px;
    }

    .error-number {
      color: @primary-color-2;
      font-size: 156px;
      font-weight: 900;
      height: 150px;
      line-height: 150px;
      float: left;
      clear: none;

      &.xs {
        border-bottom: @primary-color-1 7px solid;
      }

      &:not(.xs) {
        border-right: @primary-color-1 7px solid;
        padding-right: 40px;
      }
    }

    .error-description {
      color: @primary-color-1;
      font-size: 26px;
      font-weight: 200;
      line-height: 52px;
      margin-left: 20px;
      height: 150px;
      width: 300px;
      float: left;
      clear: none;
    }
  }
</style>
