package com.edu.edupage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentInfoResponse {
    private String phoneNumber;
    private String directorName;
    private int amount;
    private String comment;
}
