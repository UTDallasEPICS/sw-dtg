<template>
  <div class="card-page">
    <div class="card-container" :class="{ flipped: isFlipped }" @click="flipCard">
      <div class="card" :class="selectedColor">
        <div class="card-front" :aria-hidden="isFlipped">
          <button
            type="button"
            class="close-card"
            aria-label="Close card and return to the spinner"
            :tabindex="isFlipped ? -1 : 0"
            @click.stop="closeCard"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h2>Question</h2>
          <p>{{ currentCard.question }}</p>
        </div>

        <div class="card-back" :aria-hidden="!isFlipped">
          <button
            type="button"
            class="close-card"
            aria-label="Close card and return to the spinner"
            :tabindex="isFlipped ? 0 : -1"
            @click.stop="closeCard"
          >
            <span aria-hidden="true">×</span>
          </button>
          <h2>Answer</h2>
          <p>{{ currentCard.answer }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const route = useRoute()

  function closeCard() {
    isFlipped.value = false
    return navigateTo({
      path: '/gamepage',
      query: {
        pin: route.query.pin,
        ...(route.query.name ? { name: route.query.name } : {}),
      },
    })
  }

  /*
   * QUESTION BANK
   */
  const questionBank = {
    blue: [
      {
        question:
          '(Y/N) You notice your friend is being ‘text bombed’ by their partner - like they are becoming obsessed with their every move. Should you be concerned?',
        answer:
          "Obsessing about a partner's whereabouts is a red flag for abusive relationships. Let your friends know you are concerned.",
      },
      {
        question:
          "(Y/N) Should you be concerned? Your friend says to you, 'You know, I'm just trying to keep them happy, I feel like I'm walking on eggshells, but you know how they are.'",
        answer:
          "Yes. These statements, 'I have tried everything to keep them happy, walking on eggshells' are said by the victims of abusive relationships.  Individuals will not say they are in an abusive relationship, but they will use these phrases to describe the abuse.",
      },
      {
        question:
          "(Y/N) Your best friend is dating someone, and you see significant changes to their appearance, taste in music and hobbies. When you confront them they say, 'Well, you know, Sam likes it better when I…'  Should you be concerned?",
        answer:
          'Yes. Significant changes to appearance, and other activities to please a partner can be a red flag for an abusive relationship.',
      },
      {
        question: 'Give 3 other words that are used to describe when someone is dating.',
        answer:
          'People define dating in different ways. Common words: going out, together, being with someone, seeing each other, hubby/wifey status, just friends, friends with benefits, hooking up. It is important both parties discuss where they are in the dating relationship.',
      },
      {
        question:
          '(Y/N) Your partner is saying you need to spend more time with them and less with your friends. When you say No, they get angry, moody and make you feel guilty. Should you be concerned?',
        answer:
          'Yes. Isolation is a key factor in abusive relationships and is patterns seen over a period of time. Isolated incidents of wanting more time together can be discussed in healthy relationships through communication.',
      },
      {
        question:
          'Describe what can happen if both parties in the relationship are not in agreement as to their dating status? ',
        answer:
          'Partners should agree to the same level of status. While this may be a difficult conversation, it will keep from problems occurring. ',
      },
    ],

    yellow: [
      {
        question: '(T/F) Abuse in relationships happens only because of anger.',
        answer:
          'False. Abuse in relationships happens because of one party desires to have power and control over another person through fear, force or manipulation.',
      },
      {
        question:
          '(Y/N) Because I said Yes once, now my partner makes me feel that I have to all the time. Can I say No?',
        answer: 'YES. Consent must be given every time. Once given doesn’t mean always given. ',
      },
      {
        question: '(T/F)Should I ask if I can kiss someone?',
        answer:
          'TRUE. Asking if you can kiss someone is showing respect to one another and ensuring that both parties are comfortable with what is happening or moving to a next step. ',
      },
      {
        question: "(Y/N) My partner cares about my every move, doesn't that mean they love me? ",
        answer:
          "NO. Constantly checking on you, extreme jealousy or insecurity, checking phone or car mileage can be signs of abusive relationships. This is much greater than caring for someone. Healthy relationships communicate to meet each other's needs and are built on trust and a certain amount of freedom. ",
      },
      {
        question: '(T/F) Consent is an agreement given through verbal communication?',
        answer:
          "True. Consent is a verbal agreement. It cannot be given if the person is not able to communicate, such as a person 'passed out'.",
      },
      {
        question:
          'You see a person at a party who is really intoxicated.  You see someone else really beginning to take advantage of them.  What should you do?',
        answer:
          "Bystander intervention can help stop someone from taking advantage of an intoxicated person at parties.  While this might be uncomfortable it will lead to a safer environment.  Don't approach alone if you don't feel safe. Get a few friends to go together to get more information.",
      },
    ],

    red: [
      {
        question: '(T/F) Only serious relationships experience abuse?',
        answer:
          'False. Whether you are in a long term, committed, or casual experience you can experience abuse.  Friendships and dating relationships can have abusive patterns. Learn red flags of unhealthy relationships.',
      },
      {
        question:
          '(Y/N) My friends tell me the best way to get back at my ex for breaking up with me is to let everyone know the truth about them. I could easily send it out on social and people would know how bad they really are. Should I?',
        answer:
          'No. This is not good advice from friends on how to handle this issue. How would you feel if someone did this to you or your friend? Sending out this type of information on social media can be called cyberbullying.',
      },
      {
        question:
          "(Y/N) I don't feel like I have an equal say or can't express how I feel in my relationship. Should I be concerned? ",
        answer:
          'YES. Remember every relationship consists of two people. Both you and your partner should have equal say and should not be afraid to express how you feel.',
      },
      {
        question: '(T/F) The most common type of sexual assault or rape is from strangers? ',
        answer:
          '7 out of 10 sexual assaults happen with someone you know. Date rape and non stranger sexual assault are the same thing. ',
      },
      {
        question:
          '(T/F) My partner and I had an argument. If we love each other, is it okay to still argue?',
        answer:
          'Every relationship has arguments and disagreements sometimes. This is normal. How you choose to deal with your disagreements is what really counts. Both people should work hard to communicate effectively. Show respect and listen to each other’s feelings and concerns. ',
      },
      {
        question:
          '(T/F) A friend tells you that their partner slapped them the other day. The best thing to do is to go confront that partner and tell them to stop! ',
        answer:
          'FALSE. First validate their courage for sharing this information with you.  Next ask them what they would like to do? This type of abuse will escalate in a relationship and it is not okay.  Encourage them to seek support through a school counselor, look up resources with them on the internet.',
      },
    ],

    purple: [
      {
        question: 'Give three examples of emotional abuse.',
        answer: 'Teasing. Bullying. Humiliation. Put downs. Betrayal. Gossiping.',
      },
      {
        question: 'Give three people or places to get help from an abusive situation.',
        answer:
          'Parent. Teacher. School Counselor. Doctor. Crisis center or help line for teens or abuse. Faith leader. Police. Trusted mentor, family friend or family member.',
      },
      {
        question: 'Give three examples of physical abuse',
        answer:
          'Slapping. Punching. Grabbing. Shaking. Smacking. Kicking. Hair pulling. Tearing clothes. Taking phone, glasses, food or other personal & important items. Choking, hurting a part of your body. Threatening to break or hurt something or someone special to you.',
      },
      {
        question: 'Ask the group to identify five ways to manage anger in a healthy way?',
        answer:
          'Identify what caused the anger. Self-awareness. Think before responding. Breathe. Count to 10. If possible, take a brief break or a short walk to allow time to think. Make a decision for your best choice. Talk about your feelings with someone you trust. Exercise. Draw to express emotions. ',
      },
    ],
  }

  /*
 I just put yellow as a placeholder, once the spinner is finished, this is where the selected color will go.
 */
  const selectedColor = useState('selectedColor', () => null)

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
    answer: '',
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
        answer: 'Return to the game page and spin the wheel.',
      }
      return
    }

    const cards = questionBank[selectedColor.value]

    if (!cards || cards.length === 0) {
      currentCard.value = {
        question: 'No questions available for this color.',
        answer: 'Please add questions to this color.',
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
    background-color: fffbd6;
  }
  .card-wrapper {
    position: relative;
  }

  .close-card {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;

    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    padding: 0; /* Overrides the general button padding */
    border: 0;
    border-radius: 50%;

    background: white;
    color: #222;
    cursor: pointer;
  }

  .close-card span {
    font-family: Arial, sans-serif;
    font-size: 28px;
    line-height: 1;
  }

  .close-card:hover {
    background: #eee;
  }

  .close-card:focus-visible {
    outline: 3px solid #cc1a1a;
    outline-offset: 2px;
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

  .card-front {
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
