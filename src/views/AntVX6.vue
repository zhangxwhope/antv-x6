<template>
  <div class="antv-x6">
    <TopMenu />
    <div class="main-wrapper">
      <LeftTools />
      <DrawContent />
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import TopMenu from "@/components/TopMenu.vue";
import LeftTools from "@/components/LeftTools.vue";
import DrawContent from "@/components/DrawContent.vue";

export default {
  name: "AntVX6",
  components: {
    TopMenu,
    LeftTools,
    DrawContent,
  },
};
</script>

<style lang="scss" scoped>
.antv-x6 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .main-wrapper {
    display: flex;
    width: 100%;
    height: calc(100% - 40px);
  }
}
</style>
