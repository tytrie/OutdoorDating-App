const buttons = document.querySelectorAll("button");
const waitlistForm = document.querySelector(".waitlist-form");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent.trim();
    window.alert(`Thanks for your interest! "${label}" will be live in the next beta.`);
  });
});

if (waitlistForm) {
  waitlistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(waitlistForm);
    const email = formData.get("email");
    const city = formData.get("city");
    window.alert(`Thanks ${email}! We'll ping you when ${city} goes live.`);
    waitlistForm.reset();
  });
}
