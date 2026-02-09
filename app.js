const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.textContent.trim();
    window.alert(`Thanks for your interest! "${label}" will be live in the next beta.`);
  });
});
