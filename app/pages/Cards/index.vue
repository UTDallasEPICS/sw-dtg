<template>
  <div class="card-page">

    <div
      class="card-container"
      :class="{ flipped: isFlipped }"
      @click="flipCard"
    >
      <div class="card" :class="selectedColor">

        <!-- Front -->
        <div class="card-front">
          <h2>Question</h2>
          <p>{{ currentCard.question }}</p>
        </div>

        <div class="card-back">
          <h2>Answer</h2>
          <p>{{ currentCard.answer }}</p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

/*
 * QUESTION BANK
 */
const questionBank = {
  blue: [
    {
      question: "(Y/N) You notice your friend is being ‘text bombed’ by their partner - like they are becoming obsessed with their every move. Should you be concerned?",
      answer: "Yes. These statements, 'I have tried everything to keep them happy, walking on eggshells' are said by the victims of abusive relationships.  Individuals will not say they are in an abusive relationship, but they will use these phrases to describe abuse that they are experiencing."
    }
  ],

  yellow: [
    {
      question: "(T/F) Abuse in relationships happens only because of anger.",
      answer: "False. Abuse in relationships happens because of one party desires to have power and control over another person through fear, force or manipulation."
    },
    {
      question: "(Y/N) Because I said Yes once, now my partner makes me feel that I have to all the time. Can I say No?",
      answer: "YES. Consent must be given every time. Once given doesn’t mean always given. "
    }
  ],

  red: [
    {
      question: "(T/F) Only serious relationships experience abuse?",
      answer: "False. Whether you are in a long term, committed, or casual experience you can experience abuse.  Friendships and dating relationships can have abusive patterns. Learn red flags of unhealthy relationships."
    }
  ],

  purple: [
    {
      question: "Give three examples of emotional abuse.",
      answer: "Teasing. Bullying. Humiliation. Put downs. Betrayal . Gossiping."
    }
  ]
}


/*
 I just put yellow as a placeholder, once the spinner is finished, this is where the selected color will go.
 */
const selectedColor = useState("selectedColor", () => null)

/*
This is whether the card is flipped or not. If the card is not flipped(false), then it's
the question. Else(true) = answer
 */
const isFlipped = ref(false)


/*
current card is the current Q/A card being displayed
 */
const currentCard = ref({
  question: '',
  answer: ''
})


/*
Finds the selected card color, then looks into the question bank for Q/As corresponding to that color, and randomly
selects one.
 */
function getRandomCard() {
  isFlipped.value = false

  if (!selectedColor.value) {
    currentCard.value = {
      question: 'Spin the wheel first to select a color.',
      answer: 'Return to the game page and spin the wheel.'
    }
    return
  }

  const cards = questionBank[selectedColor.value]

  if (!cards || cards.length === 0) {
    currentCard.value = {
      question: 'No questions available for this color.',
      answer: 'Please add questions to this color.'
    }
    return
  }
  //pick a random question
  const randomIndex = Math.floor(Math.random() * cards.length)

  //always start a new card on the question side
  currentCard.value = cards[randomIndex]
}


/*
flips the card around(presents the answer to the question on the card)
 */
function flipCard() {
  isFlipped.value = !isFlipped.value
}


/*
load a card when the page opens
 */
watch(selectedColor, getRandomCard, { immediate: true })
</script>

<style scoped>
.card-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.card-container {
  width: 250px;
  height: 400px;
  position: relative;
  perspective: 1000px;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;

  border: 3px solid black;
  border-radius: 25px;
  padding: 30px;

  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  text-align: center;

  box-sizing: border-box;

  transition: transform 0.6s;
  transform-style: preserve-3d;

}

.card-container.flipped .card {
  transform: rotateY(180deg);
}

/* Card colors */

.card.yellow {
  background-color: #f7f338;
}

.card.green {
  background-color: #4de04f;
}

.card.blue {
  background-color: #57a5ee;
}

.card.red {
  background-color: #ff3c3c;
}

.card.purple {
  background-color: #cf47c4;
}

.card-front,
.card-back {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 30px;

  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-front{
  background: inherit;
}
.card-back {
  background: inherit;
  transform: rotateY(180deg);
}
.card h2 {
  margin-bottom: 20px;
}

.card p {
  font-size: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

/* button for user to move on */
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}


</style>



