package com.edu.edupage.service;

import com.edu.edupage.dto.PaymentRequest;
import com.edu.edupage.entity.Payment;
import com.edu.edupage.entity.Student;
import com.edu.edupage.entity.User;
import com.edu.edupage.entity.Invoice;
import com.edu.edupage.enums.PaymentStatus;
import com.edu.edupage.repository.PaymentRepository;
import com.edu.edupage.repository.StudentRepository;
import com.edu.edupage.repository.UserRepository;
import com.edu.edupage.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;

    public Payment create(PaymentRequest req) {
        Student student = studentRepository.findByAccountNumber(req.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account " + req.getAccountNumber() + " not found"));

        Payment payment = Payment.builder()
                .studentId(student.getId())
                .accountNumber(req.getAccountNumber())
                .amount(req.getAmount())
                .receiptNumber(req.getReceiptNumber())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment approve(Long paymentId, Long accountantId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getPaymentStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment already processed");
        }

        User accountant = userRepository.findById(accountantId)
                .orElseThrow(() -> new RuntimeException("Accountant not found"));

        payment.setPaymentStatus(PaymentStatus.APPROVED);
        payment.setProcessedBy(accountant);
        payment.setProcessedAt(LocalDateTime.now());

        applyPaymentToInvoices(payment.getStudentId(), payment.getAmount());

        return paymentRepository.save(payment);
    }

    private void applyPaymentToInvoices(Long studentId, int amount) {
        int remainingAmount = amount;

        List<Invoice> outstandingInvoices = invoiceRepository.findByStudentId(studentId).stream()
                .filter(i -> i.getAmountPaid() < i.getAmountDue())
                .sorted(Comparator.comparing(Invoice::getDueDate))
                .collect(Collectors.toList());

        for (Invoice invoice : outstandingInvoices) {
            if (remainingAmount <= 0)
                break;

            int currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0;
            int needed = invoice.getAmountDue() - currentPaid;
            int toApply = Math.min(remainingAmount, needed);

            invoice.addPayment(toApply);
            invoiceRepository.save(invoice);

            remainingAmount -= toApply;
        }
    }

    @Transactional
    public Payment reject(Long paymentId, Long accountantId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        User accountant = userRepository.findById(accountantId)
                .orElseThrow(() -> new RuntimeException("Accountant not found"));

        payment.setPaymentStatus(PaymentStatus.REJECTED);
        payment.setProcessedBy(accountant);
        payment.setProcessedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public List<Payment> getPendingPayments() {
        return paymentRepository.findByPaymentStatus(PaymentStatus.PENDING);
    }

    public List<Payment> searchByAccount(String accountNumber) {
        return paymentRepository.findByAccountNumber(accountNumber);
    }
}
