package com.edu.edupage.service;

import com.edu.edupage.entity.ClassGroup;
import com.edu.edupage.entity.Invoice;
import com.edu.edupage.entity.Student;
import com.edu.edupage.enums.InvoiceStatus;
import com.edu.edupage.repository.ClassGroupRepository;
import com.edu.edupage.repository.InvoiceRepository;
import com.edu.edupage.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final StudentRepository studentRepository;
    private final ClassGroupRepository classGroupRepository;

    @Transactional
    public void generateMonthlyInvoicesForGroup(Long groupId, int year, int month) {
        ClassGroup group = classGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (group.getMonthlyFee() == null || group.getMonthlyFee() <= 0) {
            throw new RuntimeException("Group has no monthly fee set");
        }

        List<Student> students = group.getStudents();
        for (Student student : students) {
            try {
                generateMonthlyInvoiceForStudent(student.getId(), year, month);
            } catch (Exception e) {
                // Ignore existing
            }
        }
    }

    @Transactional
    public void generateMonthlyInvoiceForStudent(Long studentId, int year, int month) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getClassGroup() == null) {
            throw new RuntimeException("Student has no class group");
        }

        int fee = student.getClassGroup().getMonthlyFee() != null ? student.getClassGroup().getMonthlyFee() : 0;
        LocalDate dueDate = LocalDate.of(year, month, 1).plusMonths(1).withDayOfMonth(5);

        boolean exists = invoiceRepository.findByStudentId(studentId).stream()
                .anyMatch(i -> i.getYear() != null && i.getYear() == year &&
                        i.getMonth() != null && i.getMonth() == month);

        if (exists) {
            throw new RuntimeException("Invoice already exists");
        }

        Invoice invoice = Invoice.builder()
                .student(student)
                .amountDue(fee)
                .amountPaid(0)
                .dueDate(dueDate)
                .year(year)
                .month(month)
                .status(InvoiceStatus.UNPAID)
                .build();

        invoiceRepository.save(invoice);
    }

    public List<Invoice> getStudentInvoices(Long studentId) {
        return invoiceRepository.findByStudentId(studentId);
    }

    public List<Invoice> getInvoicesByAccountNumber(String accountNumber) {
        Student student = studentRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return invoiceRepository.findByStudentId(student.getId());
    }

    public long calculateTotalDebt(Long studentId) {
        return invoiceRepository.findByStudentId(studentId).stream()
                .filter(i -> i.getStatus() != InvoiceStatus.PAID && i.getStatus() != InvoiceStatus.CANCELLED)
                .mapToLong(i -> i.getAmountDue() - (i.getAmountPaid() != null ? i.getAmountPaid() : 0))
                .sum();
    }
}
