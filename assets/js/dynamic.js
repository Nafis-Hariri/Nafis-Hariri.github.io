// Dynamic Portfolio & Form Handler Script for Nafis Hariri Portfolio
$(document).ready(function() {
  console.log("Dynamic portfolio script loaded successfully.");

  // 1. Dynamic Projects Data
  const projectsData = [
    {
      id: 1,
      title: "Family 100",
      category: "Web App / Game",
      description: "Sebuah website permainan sederhana yang terinspirasi dari TV show populer",
      url: "https://Nafis-Hariri.github.io/Familly-100",
      image: "assets/img/Screenshot.png"
    },
    {
      id: 2,
      title: "Metiew & Smith",
      category: "Webdesign",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do.",
      url: "#0",
      image: "assets/img/work-metiew-smith.jpg"
    },
    {
      id: 3,
      title: "Alex Nowak",
      category: "UI/UX Design",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit sed do.",
      url: "#0",
      image: "assets/img/work-alex-nowak.jpg"
    }
  ];

  // 2. Dynamic Form Submission Handler for Work Request / Hire Us
  $('.work-request').on('submit', function(e) {
    e.preventDefault();

    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const selectedOptions = [];
    $('.work-request input[type="checkbox"]:checked').each(function() {
      selectedOptions.push($(this).val());
    });

    // Validation
    if (!name || !email) {
      alert('Mohon isi nama dan email Anda terlebih dahulu!');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      alert('Mohon masukkan format email yang valid!');
      return;
    }

    // Dynamic Success Feedback
    const submitBtn = $(this).find('input[type="submit"]');
    const originalText = submitBtn.val();
    submitBtn.val('Sending...').prop('disabled', true);

    setTimeout(function() {
      alert(`Terima kasih, ${name}! Request Anda untuk layanan (${selectedOptions.join(', ') || 'General'}) telah berhasil dikirim. Kami akan segera menghubungi Anda di ${email}.`);
      $('.work-request')[0].reset();
      $('.work-request input').removeClass('has-value');
      submitBtn.val(originalText).prop('disabled', false);
    }, 1000);
  });

  // 3. Dynamic Greeting based on time
  const currentHour = new Date().getHours();
  let greeting = "Welcome";
  if (currentHour >= 4 && currentHour < 11) greeting = "Selamat Pagi";
  else if (currentHour >= 11 && currentHour < 15) greeting = "Selamat Siang";
  else if (currentHour >= 15 && currentHour < 18) greeting = "Selamat Sore";
  else greeting = "Selamat Malam";

  // Optional: add a dynamic badge or toast if desired
  console.log(`${greeting} di Portofolio Nafis Hariri!`);
});
