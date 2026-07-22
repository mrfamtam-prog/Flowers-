const flower = document.getElementById("flower");
const message = document.getElementById("message");
const music = document.getElementById("bgMusic");

let currentFlower = 1;
const totalFlowers = 10;

// Some browsers require user interaction before playing audio
document.body.addEventListener("click", () => {
    music.play().catch(() => {});
}, { once: true });

flower.addEventListener("click", () => {

    // Bloom animation
    flower.classList.add("bloom");

    setTimeout(() => {
        flower.classList.remove("bloom");

        currentFlower++;

        if (currentFlower <= totalFlowers) {

            flower.style.opacity = "0";

            setTimeout(() => {

                flower.src = `images/flower${currentFlower}.png`;

                message.innerHTML = `Flower ${currentFlower} of ${totalFlowers}`;

                flower.style.opacity = "1";

            }, 300);

        } else {

            finalCelebration();
                <div style="
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    background:linear-gradient(135deg,#1b2735,#090a0f);
                    color:white;
                    text-align:center;
                    padding:20px;
                    animation:fadeIn 1.2s;
                ">
                    <h1 style="font-size:3rem;">🎉 Congratulations! 🎉</h1>

                    <h2>You discovered all 10 flowers! 🌸</h2>

                    <p style="margin-top:20px;font-size:20px;">
                        Every flower blooms with love.
                        Thank you for completing the journey ❤️
                    </p>

                    <button onclick="location.reload()"
                    style="
                        margin-top:35px;
                        padding:15px 35px;
                        border:none;
                        border-radius:50px;
                        font-size:18px;
                        cursor:pointer;
                        background:#ff69b4;
                        color:white;
                    ">
                        Start Again
                    </button>
                </div>
            `;
        }

    }, 800);

});
const petals = document.getElementById("petals");

function createPetal(){

    const petal = document.createElement("div");

    petal.className = "petal";

    petal.style.left = Math.random()*100 + "vw";

    petal.style.animationDuration = (4 + Math.random()*5) + "s";

    petal.style.opacity = Math.random();

    petal.style.transform = `scale(${0.5 + Math.random()})`;

    petals.appendChild(petal);

    setTimeout(()=>{
        petal.remove();
    },9000);

}

setInterval(createPetal,250);
// Containers
const butterflies = document.getElementById("butterflies");
const fireflies = document.getElementById("fireflies");
const hearts = document.getElementById("hearts");

// Flying butterflies
function createButterfly(){

    const b = document.createElement("div");

    b.className="butterfly";

    b.innerHTML="🦋";

    b.style.top=Math.random()*80+"vh";

    b.style.animationDuration=(8+Math.random()*6)+"s";

    butterflies.appendChild(b);

    setTimeout(()=>b.remove(),15000);

}

setInterval(createButterfly,4000);

// Fireflies
for(let i=0;i<30;i++){

    const f=document.createElement("div");

    f.className="firefly";

    f.style.left=Math.random()*100+"vw";

    f.style.top=Math.random()*100+"vh";

    f.style.animationDelay=Math.random()*2+"s";

    fireflies.appendChild(f);

}

// Hearts when clicking flower
flower.addEventListener("click",()=>{

    for(let i=0;i<12;i++){

        const h=document.createElement("div");

        h.className="heart";

        h.innerHTML="❤️";

        h.style.left=(window.innerWidth/2+(Math.random()*120-60))+"px";

        h.style.top=(window.innerHeight/2)+"px";

        hearts.appendChild(h);

        setTimeout(()=>h.remove(),1500);

    }

});
// Loading Screen
window.onload = () => {

setTimeout(() => {

document.getElementById("loader").style.opacity="0";

setTimeout(()=>{

document.getElementById("loader").remove();

},1000);

},2000);

};


// Final Celebration

function finalCelebration(){

document.body.innerHTML=`

<div style="

height:100vh;

display:flex;

flex-direction:column;

justify-content:center;

align-items:center;

background:linear-gradient(135deg,#ff9a9e,#fad0c4,#fad0c4);

text-align:center;

color:white;

padding:20px;

">

<h1>🌸 Congratulations 🌸</h1>

<p class="typewriter">

You discovered every flower.

Thank you for taking this beautiful journey.

Every flower carries a little piece of happiness.

❤️

</p>

<div class="gift" onclick="openGift()">

🎁

</div>

</div>

`;

}


// Gift

function openGift(){

document.body.innerHTML=`

<div style="

height:100vh;

display:flex;

justify-content:center;

align-items:center;

flex-direction:column;

background:#111;

color:white;

">

<h1 style="font-size:60px;">❤️</h1>

<h2>

You are amazing.

May your life always bloom like these flowers.

🌸🌹🌺🌼

</h2>

<button onclick="location.reload()"

style="

margin-top:30px;

padding:15px 35px;

font-size:18px;

border:none;

border-radius:40px;

cursor:pointer;

">

Play Again

</button>

</div>

`;

}