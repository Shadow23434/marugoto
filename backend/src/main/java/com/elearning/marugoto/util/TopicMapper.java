package com.elearning.marugoto.util;

import com.elearning.marugoto.model.dto.request.TopicRequest;
import com.elearning.marugoto.model.dto.response.TopicResponse;
import com.elearning.marugoto.model.entity.Topic;

public class TopicMapper {

    public static TopicResponse toResponse(Topic t) {
        if (t == null) return null;
        TopicResponse r = new TopicResponse();
        r.setId(t.getId());
        r.setSlug(t.getSlug());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setThumbnail(t.getThumbnail());
        r.setLanguage(t.getLanguage());
        r.setType(t.getType());
        r.setOrderIndex(t.getOrderIndex());
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }

    public static Topic toEntity(TopicRequest req) {
        if (req == null) return null;
        Topic t = new Topic();
        t.setSlug(req.getSlug());
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setThumbnail(req.getThumbnail());
        t.setLanguage(req.getLanguage());
        t.setType(req.getType());
        t.setOrderIndex(req.getOrderIndex());
        return t;
    }
}

