package com.kiosk.kioskserver.service;

import com.kiosk.kioskserver.entity.Certificate;
import com.kiosk.kioskserver.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public List<Certificate> getAll() {
        return certificateRepository.findByActiveTrue();
    }

    public List<Certificate> getByCategory(String category) {
        return certificateRepository.findByCategory(category);
    }
}
