package com.edu.edupage.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String accountNumber;
    private int amount;
    private String receiptNumber;
}
