package com.kiosk.kioskserver.service;

import com.kiosk.kioskserver.dto.CertificateResponse;
import com.kiosk.kioskserver.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public List<CertificateResponse> getAllActive() {
        return certificateRepository.findByActiveTrue()
                .stream()
                .map(CertificateResponse::from)
                .collect(Collectors.toList());
    }

    public List<CertificateResponse> getByCategory(String category) {
        return certificateRepository.findByCategoryAndActiveTrue(category)
                .stream()
                .map(CertificateResponse::from)
                .collect(Collectors.toList());
    }
}
