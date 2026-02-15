package com.edu.edupage.entity;

import com.edu.edupage.enums.InvoiceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Integer amountDue;

    @Column(nullable = false)
    private Integer amountPaid;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    private Integer year;
    private Integer month;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (amountPaid == null)
            amountPaid = 0;
        if (status == null)
            status = InvoiceStatus.UNPAID;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addPayment(int amount) {
        if (this.amountPaid == null)
            this.amountPaid = 0;
        this.amountPaid += amount;
        updateStatus();
    }

    public void updateStatus() {
        if (amountPaid >= amountDue) {
            this.status = InvoiceStatus.PAID;
        } else if (amountPaid > 0) {
            this.status = InvoiceStatus.PARTIALLY_PAID;
        } else {
            this.status = InvoiceStatus.UNPAID; // Or OVERDUE if checked against date
        }

        if (amountPaid < amountDue && LocalDate.now().isAfter(dueDate)) {
            this.status = InvoiceStatus.OVERDUE;
        }
    }
}
