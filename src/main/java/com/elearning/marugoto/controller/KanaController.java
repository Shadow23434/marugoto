package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.response.KanaResponse;
import com.elearning.marugoto.model.enums.KanaType;
import com.elearning.marugoto.service.impl.KanaServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/kana")
@CrossOrigin(origins = "*")
public class KanaController {

    @Autowired
    private KanaServiceImpl kanaService;

    @GetMapping("/hiragana")
    public ResponseEntity<KanaResponse> getHiragana() {
        return ResponseEntity.ok(kanaService.getKanaData(KanaType.HIRAGANA));
    }

    @GetMapping("/katakana")
    public ResponseEntity<KanaResponse> getKatakana() {
        return ResponseEntity.ok(kanaService.getKanaData(KanaType.KATAKANA));
    }
}