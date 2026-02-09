const buttons = document.querySelectorAll("button");
const waitlistForm = document.querySelector(".waitlist-form");

buttons.forEach((button) => {
  const scrollTarget = button.dataset.scroll;
  if (scrollTarget) {
    button.addEventListener("click", () => {
      const target = document.querySelector(scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    return;
  }

  const alertMessage = button.dataset.alert;
  if (alertMessage) {
    button.addEventListener("click", () => {
      window.alert(alertMessage);
    });
  }
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
