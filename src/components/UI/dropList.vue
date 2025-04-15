
<script setup>
import { ref } from 'vue';

let show = ref(0);
const toggleShow = function(){
    show.value = !show.value
}
</script>

<template>  
    <div>
        <button class = "drop-title" @click = "toggleShow">
            
            <slot name = "title"></slot>
            <img :class="{active: show}" class = "color mt-1" src="../../assets/triangle.png" alt="">
        </button>
        <div class="content ml-4" v-if="show">
            <slot name = "content"></slot>
        </div>
    </div>
</template>

<style scoped lang='scss'>

.color{
    filter:invert(1)
}
.dark .color{
    filter:invert(0);
}
.drop-title{
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    border: none;
    background: none;
    font-size: 1rem;
    margin-bottom: 0.125rem;
    .active{
        rotate: 90deg;
    }
    img{
        transition: 0.2s all ease;
        height: 0.75rem;
        margin-left: 0.25rem;
        width: 0.75rem;
    }
}


</style>