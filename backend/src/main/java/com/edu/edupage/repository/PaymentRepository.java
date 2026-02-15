package com.edu.edupage.repository;

import com.edu.edupage.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    java.util.List<Payment> findByStudentId(Long studentId);

    java.util.List<Payment> findByAccountNumber(String accountNumber);

    java.util.List<Payment> findByPaymentStatus(com.edu.edupage.enums.PaymentStatus status);
}
