<script setup lang= "ts">

import { ref } from "vue";

const isSpinning = ref(false);

const spin = () => {
    isSpinning.value = true;

    setTimeout(() => {
        isSpinning.value = false;
    }, 2000);
};

</script>

<template>
    <div class="game">

        <h1>Stronger Twister</h1>

        <div class="spin-card">

            <div class="spin-text">
                Spin
            </div>

            <div> 
            class="wheel"
            :class="{ spinning: isSpinning }"
            @click="spin"
            </div>

        </div>

        <button class="deck-button">
            Deck!
        </button>

    </div>
</template>

<style>


body {
    margin: 0;
    background-color: #f2f2f2;
    font-family: Arial, sans-serif;
}

.game {
    width: 300px;
    margin: 30px auto;
    padding: 10px;
    background-color: #fffbd6;
    border-radius: 20px;
    text-align: center;
}

h1 {
    font-size: 30px;
    margin: 0 0 25px 0;
}

/* White card */
.spin-card {
    width: 170px;
    height: 280px;
    margin: 0 auto 20px auto;

    background-color: white;
    border-radius: 18px;

    box-shadow: 7px 5px 0px #222;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.spin-text {
    font-size: 55px;
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 5px;
}

/* Color wheel */
.wheel {
    width: 145px;
    height: 145px;

    border-radius: 50%;

    background: conic-gradient(
        #4d9bf5 0deg 90deg,
        #f7f522 90deg 180deg,
        #e52e32 180deg 270deg,
        #7774d9 270deg 360deg
    );

    border: 1px solid black;
    
    cursor: pointer;
}

/* spinning */
.spinning {
    animation: spin 2s ease-out;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(1440deg);
    }
}

/* Deck button */
.deck-button {
    width: 210px;
    height: 115px;

    border: none;
    border-radius: 25px;

    background-color: white;

    font-size: 28px;
    font-weight: bold;

    cursor: pointer;
}

.deck-button:hover {
    background-color: #eeeeee;
}




</style>


