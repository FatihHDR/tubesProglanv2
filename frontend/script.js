const BACKEND_URL = 'http://localhost:3000';

    // Daftar kredensial valid
    const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'user', password: 'user123' }
    ];

    // Fungsi parsing mata uang
    function parseCurrency(currencyString) {
        return parseFloat(
            currencyString
                .replace('Rp ', '')     // Hapus "Rp "
                .replace(/\./g, '')     // Hapus semua titik
                .replace(',', '.')      // Ganti koma dengan titik
        ) || 0;
    }

    function updateTotals(pemasukan, pengeluaran) {
        const currentIncome = parseCurrency(document.getElementById('incomeLabel').innerText);
        const currentExpense = parseCurrency(document.getElementById('expenseLabel').innerText);

        const newIncome = currentIncome + pemasukan;
        const newExpense = currentExpense + pengeluaran;
        const newBalance = newIncome - newExpense;

        document.getElementById('incomeLabel').innerText = `Rp ${newIncome.toLocaleString('id-ID')}`;
        document.getElementById('expenseLabel').innerText = `Rp ${newExpense.toLocaleString('id-ID')}`;
        document.getElementById('balanceLabel').innerText = `Rp ${newBalance.toLocaleString('id-ID')}`;
    }

    // Fungsi Export PDF
    function exportToPDF() {
        // Cek apakah ada transaksi
        const tableBody = document.querySelector('#transactionTable tbody');
        const rows = tableBody.querySelectorAll('tr');

        if (rows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Tidak Ada Data',
                text: 'Tidak ada transaksi untuk di-export!'
            });
            return;
        }

        // Ambil informasi keuangan
        const incomeLabel = document.getElementById('incomeLabel').innerText;
        const expenseLabel = document.getElementById('expenseLabel').innerText;
        const balanceLabel = document.getElementById('balanceLabel').innerText;

        // Buat dokumen PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        // Judul dokumen
        doc.setFontSize(18);
        doc.setTextColor(52, 152, 219); // Warna biru
        doc.text('Laporan Keuangan UMKM', 40, 40);

        // Informasi Ringkasan
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Pemasukan: ${incomeLabel}`, 40, 70);
        doc.text(`Pengeluaran: ${expenseLabel}`, 40, 90);
        doc.text(`Saldo: ${balanceLabel}`, 40, 110);

        // Konversi tabel ke PDF
        doc.autoTable({
            html: '#transactionTable',
            startY: 150,
            theme: 'striped',
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [52, 152, 219],
                textColor: [255, 255, 255]
            }
        });

        doc.save(`Laporan_Keuangan_UMKM_${new Date().toLocaleDateString()}.pdf`);
    }

    // Event listener untuk tombol export
    document.getElementById('exportButton').addEventListener('click', function() {
        Swal.fire({
            title: 'Export Laporan',
            text: 'Apakah Anda ingin mengexport laporan keuangan?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Export',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                exportToPDF();
            }
        });
    });

    // Fungsi validasi email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function sendEmailWithPDF() {
    console.log('Fungsi sendEmailWithPDF dipanggil');

    // Ambil nilai input
    const emailPenerima = document.getElementById('emailPenerima').value.trim();
    const judulEmail = document.getElementById('judulEmail').value.trim();
    const pesanEmail = document.getElementById('pesanEmail').value.trim();

    // Validasi email
    if (!validateEmail(emailPenerima)) {
        Swal.fire({
            icon: 'error',
            title: 'Email Tidak Valid',
            text: 'Silakan masukkan alamat email yang benar!'
        });
        return;
    }

    // Cek apakah ada transaksi
    const tableBody = document.querySelector('#transactionTable tbody');
    const rows = tableBody.querySelectorAll('tr');

    if (rows.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Tidak Ada Data',
            text: 'Tidak ada transaksi untuk dikirim!'
        });
        return;
    }

    // Generate PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Tambahkan konten PDF
    doc.setFontSize(18);
    doc.setTextColor(52, 152, 219);
    doc.text('Laporan Keuangan UMKM', 40, 40);

    // Informasi Ringkasan
    const incomeLabel = document.getElementById('incomeLabel').innerText;
    const expenseLabel = document.getElementById('expenseLabel').innerText;
    const balanceLabel = document.getElementById('balanceLabel').innerText;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pemasukan: ${incomeLabel}`, 40, 70);
    doc.text(`Pengeluaran: ${expenseLabel}`, 40, 90);
    doc.text(`Saldo: ${balanceLabel}`, 40, 110);

    doc.autoTable({
        html: '#transactionTable',
        startY: 150,
        theme: 'striped',
        styles: {
            fontSize: 10,
            cellPadding: 5
        },
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255]
        }
    });

    const pdfBase64 = doc.output('datauristring');

    Swal.fire({
        title: 'Konfirmasi Pengiriman Email',
        text: `Kirim laporan ke ${emailPenerima}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Kirim',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Debug: Log data yang akan dikirim
            console.log('Data yang akan dikirim:', {
                to: emailPenerima,
                subject: judulEmail,
                body: pesanEmail,
                pdfBase64Length: pdfBase64.length
            });

            // Kirim ke backend dengan error handling yang lebih baik
            fetch(`${BACKEND_URL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    to: emailPenerima,
                    subject: judulEmail || 'Laporan Keuangan UMKM',
                    body: pesanEmail || 'Terlampir adalah laporan keuangan UMKM',
                    pdfBase64: pdfBase64
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                
                // Tangani berbagai status response
                if (!response.ok) {
                    // Coba ambil pesan error dari response
                    return response.json().then(errorData => {
                        console.error('Error response:', errorData);
                        throw new Error(errorData.error || 'Gagal mengirim email');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log(' Email berhasil dikirim:', data.messageId);
                Swal.fire({
                    icon: 'success',
                    title: 'Email Terkirim',
                    text: 'Laporan telah berhasil dikirim ke ' + emailPenerima
                });
            })
            .catch(error => {
                console.error('Kesalahan saat mengirim email:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Pengiriman Gagal',
                    text: error.message
                });
            });
        }
    });
}

// Tambahkan event listener untuk tombol kirim email
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Cari tombol kirim email
    const emailButton = document.getElementById('emailButton');
    const kirimEmailButton = document.getElementById('kirimEmailButton');

    // Log keberadaan tombol
    console.log('Email Button:', emailButton);
    console.log('Kirim Email Button:', kirimEmailButton);

    // Event listener untuk membuka modal
    if (emailButton) {
        emailButton.addEventListener('click', function() {
            console.log('Email button clicked');
            
            // Cek apakah ada transaksi
            const tableBody = document.querySelector('#transactionTable tbody');
            const rows = tableBody.querySelectorAll('tr');

            if (rows.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Tidak Ada Data',
                    text: 'Tidak ada transaksi untuk dikirim!'
                });
                return;
            }

            const kirimEmailModal = new bootstrap.Modal(document.getElementById('kirimEmailModal'));
            kirimEmailModal.show();
        });
    }

    if (kirimEmailButton) {
        kirimEmailButton.addEventListener('click', function(event) {
            console.log('Kirim email button clicked');
            sendEmailWithPDF();
        });
    }
});


    function deleteTransaction(button) {
        const row = button.parentNode.parentNode;
        const pemasukan = parseCurrency(row.cells[2].innerText);
        const pengeluaran = parseCurrency(row.cells[3].innerText);

        row.parentNode.removeChild(row);
        updateTotals(-pemasukan, -pengeluaran);

        Swal.fire({
            icon: 'success',
            title: 'Sukses',
            text: 'Transaksi berhasil dihapus!'
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        let loginAttempts = 0;
        const MAX_ATTEMPTS = 3;

        // Ambil elemen-elemen penting
        const loginForm = document.getElementById('loginForm');
        const loginPage = document.getElementById('loginPage');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!loginForm || !loginPage || !dashboardContainer || !usernameInput || !passwordInput) {
            console.error('Salah satu elemen tidak ditemukan!');
            return;
        }

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            if (loginAttempts >= MAX_ATTEMPTS) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Akses Ditolak',
                    text: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
                    confirmButtonText: 'Mengerti'
                });
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            const isLoginValid = validCredentials.some(cred =>
                cred.username === username && cred.password === password
            );

            if (isLoginValid) {
                loginAttempts = 0;

                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: `Selamat datang, ${username}!`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    loginPage.style.display = 'none';

                    dashboardContainer.style.display = 'block';
                });
            } else {
                loginAttempts++;

                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: `Username atau Password Salah! (Percobaan ${loginAttempts}/${MAX_ATTEMPTS})`,
            confirmButtonText: 'Coba Lagi'
        });

        // Tetap di halaman login
        loginPage.style.display = 'flex';
        dashboardContainer.style.display = 'none';

        passwordInput.value = '';
        passwordInput.focus();

        if (loginAttempts >= MAX_ATTEMPTS) {
            Swal.fire({
                icon: 'warning',
                title: 'Akun Diblokir',
                text: 'Terlalu banyak percobaan login. Akun sementara diblokir.',
                confirmButtonText: 'Mengerti'
            });
        }
    }
    });

    document.getElementById('logoutButton').addEventListener('click', function() {
        dashboardContainer.style.display = 'none';
        loginPage.style.display = 'flex';

        loginForm.reset();
    });

    const tambahTransaksiModal = new bootstrap.Modal(document.getElementById('tambahTransaksiModal'));

    document.getElementById('addButton').addEventListener('click', function() {
        tambahTransaksiModal.show();
    });

    document.getElementById('saveTransactionButton').addEventListener('click', function() {
        const tanggal = document.getElementById('tanggal').value;
        const deskripsi = document.getElementById('deskripsi').value;

        const pemasukan = parseFloat(document.getElementById('pemasukan').value) || 0;
        const pengeluaran = parseFloat(document.getElementById('pengeluaran').value) || 0;

        if (!tanggal || !deskripsi) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Tanggal dan Deskripsi harus diisi!'
            });
            return;
        }

        const transactionTable = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
        const newRow = transactionTable.insertRow();

        newRow.insertCell(0).innerText = tanggal;
        newRow.insertCell(1).innerText = deskripsi;
        newRow.insertCell(2).innerText = pemasukan > 0 ? `Rp ${pemasukan.toLocaleString('id-ID')}` : '-';
        newRow.insertCell(3).innerText = pengeluaran > 0 ? `Rp ${pengeluaran.toLocaleString('id-ID')}` : '-';
        newRow.insertCell(4).innerHTML = `<button class="btn btn-danger btn-sm" onclick="deleteTransaction(this)">Hapus</button>`;

        updateTotals(pemasukan, pengeluaran);

        Swal.fire({
            icon: 'success',
            title: 'Sukses',
            text: 'Transaksi berhasil ditambahkan!'
        });

        document.getElementById('transaksiForm').reset();
        tambahTransaksiModal.hide();
    });
    });