package com.gmmoved.model;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {
	
	Subscription findByEmail(String email);
}

