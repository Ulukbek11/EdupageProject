package com.edu.edupage.controller;

import com.edu.edupage.entity.Invoice;
import com.edu.edupage.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate/student")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> generateForStudent(
            @RequestParam Long studentId,
            @RequestParam int year,
            @RequestParam int month) {
        invoiceService.generateMonthlyInvoiceForStudent(studentId, year, month);
        return ResponseEntity.ok("Invoice generated");
    }

    @PostMapping("/generate/group")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> generateForGroup(
            @RequestParam Long groupId,
            @RequestParam int year,
            @RequestParam int month) {
        invoiceService.generateMonthlyInvoicesForGroup(groupId, year, month);
        return ResponseEntity.ok("Group invoices generated");
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'ACCOUNTANT', 'STUDENT')")
    public ResponseEntity<List<Invoice>> getStudentInvoices(@PathVariable Long studentId) {
        return ResponseEntity.ok(invoiceService.getStudentInvoices(studentId));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<Invoice>> searchByAccount(@RequestParam String accountNumber) {
        return ResponseEntity.ok(invoiceService.getInvoicesByAccountNumber(accountNumber));
    }

    @GetMapping("/debt/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'ACCOUNTANT', 'STUDENT')")
    public ResponseEntity<Map<String, Long>> getStudentDebt(@PathVariable Long studentId) {
        long debt = invoiceService.calculateTotalDebt(studentId);
        return ResponseEntity.ok(Map.of("totalDebt", debt));
    }
}
