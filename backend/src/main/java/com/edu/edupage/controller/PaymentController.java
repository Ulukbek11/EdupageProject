package com.edu.edupage.controller;

import com.edu.edupage.dto.PaymentRequest;
import com.edu.edupage.entity.Payment;
import com.edu.edupage.entity.User;
import com.edu.edupage.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Payment> submitPayment(@RequestBody PaymentRequest req) {
        return ResponseEntity.ok(paymentService.create(req));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<List<Payment>> getPending() {
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<List<Payment>> searchByAccount(@RequestParam String accountNumber) {
        return ResponseEntity.ok(paymentService.searchByAccount(accountNumber));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<Payment> approvePayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User accountant) {
        return ResponseEntity.ok(paymentService.approve(id, accountant.getId()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'ADMIN')")
    public ResponseEntity<Payment> rejectPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal User accountant) {
        return ResponseEntity.ok(paymentService.reject(id, accountant.getId()));
    }
}
